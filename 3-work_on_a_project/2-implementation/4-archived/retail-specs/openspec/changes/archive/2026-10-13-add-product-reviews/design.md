# Design

## Context

See proposal.md for motivation and specs/ for the required behavior.

- `retail-api` has four bounded contexts (`products`, `checkout`, `orders`, `users`). ESLint enforces the boundaries through a `backendContexts` list in `eslint.config.mjs`. Contexts collaborate only through consumer-owned ports adapted to the provider's `application/` use cases (e.g. `orders` → `UsersCustomerDirectory` → `UsersByIdsSearcher`).
- There is no authentication. The current customer is `FakeSessionCurrentUserProvider` (`user-a1c92f04`), and `/me/**` endpoints resolve it inside the API. The backoffice is open.
- Orders store their lines with a plain `product_id` (no FK), and `Order` exposes `lines: OrderLine[]` with `productId`. `OrderRepository.searchByUser(userId)` already exists. The only order status is `confirmed`.
- There is no migrations tool: schema changes go into `database/schema.sql` and are re-applied with `db:reset` / `db:test:reset`.
- `retail-web` reaches the API only through `RetailApi`. Server actions return `ActionState` (`{ error }`) and map `RetailApiError.type` with `actionStateFor` plus per-action `UserFacingMessages`. Pages are not tested: logic lives in the API or in tested components.

## Goals / Non-Goals

**Goals:**
- Keep every review rule (content, buyers only, one per customer, pending first, moderated once) in the `reviews` domain and use cases, unit-tested.
- Have the API decide what the product page shows for the current customer (form, awaiting moderation, already reviewed, nothing), so the page stays thin.
- Reuse the admin write-flow pattern from outfits (server action + `actionStateFor` + `revalidatePath`).

**Non-Goals:**
- Authentication or roles for staff. The backoffice stays open, as it is today.
- Editing, deleting or re-moderating reviews, by authors or by staff. Staff can't see past decisions either: no history screen.
- Pagination of reviews or of the moderation queue, rating filters, sorting options or "helpful" votes.
- Showing a rating summary outside the product page (cards, grids, search).
- Notifying customers about moderation outcomes.

## Decisions

### 1. A new `reviews` bounded context

`Review` (aggregate), `ReviewId`, `ReviewRating`, `ReviewStatus`, `ReviewRepository` and the domain errors live in `src/contexts/backend/reviews/`. `reviews` is added to `backendContexts` in `eslint.config.mjs`.

- **Alternative: inside `products` (like outfits).** Outfits went to `products` because `products`' own listers needed them. Reviews need orders (purchase check) and users (author names), and no product use case needs reviews. Putting them in `products` would make `products` depend on `orders`, while `checkout` already depends on both. Rejected.
- **Alternative: inside `orders`.** Reviews are about the product, not the order, and the product page would depend on the orders context. Rejected.

`reviews` depends on the others only through its own ports (§3). Nothing depends on `reviews`, so there is no cycle.

### 2. Domain model

- `Review.create(id, productId, authorId, productName, rating, title, body, createdAt)` validates and starts as `pending`. `ReviewRating` accepts integers 1–5 (`InvalidReviewRatingError`). Title and body are trimmed and must be non-blank and at most 100 / 2000 characters (`InvalidReviewTitleError`, `InvalidReviewBodyError`). The messages name the field and the limit.
- `review.approve()` / `review.reject()` move a `pending` review to `approved` / `rejected`. Anything else throws `ReviewAlreadyModeratedError`. `ReviewStatus` is a literal union parsed with `parseLiteral`, like `OrderStatus`.
- `Review.fromPrimitives` does not validate, like `Outfit`, so later rule changes don't break stored reviews.
- `ProductId` and `UserId` come from the shared kernel. `ReviewId` stays local.
- `createdAt` comes from `Clock` and the id from `IdGenerator`, so tests stay deterministic.
- `productName` is copied when the review is written, following the "copy at the time it happens" rule. The queue can then show it with no products lookup, and it survives catalog changes.

### 3. Ports to other contexts

| Port (reviews/domain) | Adapter (reviews/infrastructure) | Provider use case |
|---|---|---|
| `PurchaseHistory.hasBought(userId, productId): boolean` | `OrdersPurchaseHistory` | new `orders` `ProductPurchaseChecker` (`application/check-purchase/`): `searchByUser(userId)` and `order.includesProduct(productId)` |
| `ReviewedProducts.nameOf(productId): string \| null` | `ProductsReviewedProducts` | existing `ProductFinder` |
| `ReviewerDirectory.namesOf(userIds): ReviewerNames` | `UsersReviewerDirectory` | existing `UsersByIdsSearcher` |

- `Order.includesProduct(productId)` is the single definition of "this order contains the product", covering any variant. It is unit-tested through `ProductPurchaseChecker`.
- Author names are joined when reading, like `CustomerDirectory` in `orders`, because users can't change their name today. A missing user falls back to the user id inside `ReviewerNames`, as `CustomerNames` does.
- **Alternative: a SQL join from `reviews` to `orders`/`users`.** It would break the context boundaries. Rejected.

### 4. Persistence

```sql
create table reviews (
	id text primary key,
	product_id text not null,
	user_id text not null references users(id),
	product_name text not null,
	rating integer not null check (rating between 1 and 5),
	title text not null,
	body text not null,
	status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
	created_at timestamptz not null
);

create unique index reviews_product_id_user_id_key on reviews(product_id, user_id);
create index reviews_product_id_status_idx on reviews(product_id, status);
create index reviews_status_created_at_idx on reviews(status, created_at);
```

- `product_id` has no FK, like `order_lines`. Reviews are history written by customers, so removing a product from the catalog must not fail or cascade over them.
- The unique index on `(product_id, user_id)` backs up the "one review per customer" check in the use case. `PostgresReviewRepository` maps a unique violation to `ReviewAlreadyExistsError`, like outfit names.
- Repository: `save`, `search(id)`, `searchByProductAndAuthor(productId, userId)`, `searchApprovedByProduct(productId)` (newest first), `searchPending()` (oldest first). Ordering and status filtering happen in SQL.
- Moderation saves with `update ... where id = $id and status = 'pending'`. If no row changed, it throws `ReviewAlreadyModeratedError`, so two concurrent moderations can't both win.

### 5. Use cases

| Use case | Folder | Returns |
|---|---|---|
| `ReviewSubmitter` | `application/submit/` | `void` |
| `ReviewEligibilityChecker` | `application/check-eligibility/` | `{ status: "can-review" \| "pending-review" \| "already-reviewed" \| "not-purchased" }` |
| `ProductReviewsGetter` | `application/get-product-reviews/` | `ProductReviewsResponse` |
| `PendingReviewsLister` | `application/list-pending/` | `PendingReviewResponse[]` |
| `ReviewApprover` | `application/approve/` | `void` |
| `ReviewRejecter` | `application/reject/` | `void` |

- `ReviewSubmitter.submit(productId, rating, title, body)` takes the author from `CurrentUserProvider`. It checks in this order:
  1. Content: `Review.create` validates it.
  2. Purchase: `ProductNotPurchasedError`.
  3. Existing review: `ReviewAlreadyExistsError`.
  4. Product name: `ReviewedProductNotFoundError` when the catalog no longer has the product.
- `ReviewEligibilityChecker.check(productId)` uses the current user. No purchase gives `not-purchased`. A purchase with no review gives `can-review`. A pending review gives `pending-review`, and an approved or rejected one gives `already-reviewed`. The customer is never told whether their review was rejected.
- `ProductReviewsResponse = { averageRating: number | null; reviewCount: number; reviews: { id, rating, title, body, authorName, createdAt }[] }`. It covers approved reviews only, newest first. `averageRating` is rounded to one decimal, and is `null` when there are none. The average is computed in the use case from the approved reviews it already loads.
- `PendingReviewResponse = { id, productId, productName, authorName, rating, title, body, createdAt }`, oldest first.
- `ReviewApprover.approve(id)` / `ReviewRejecter.reject(id)` throw `ReviewNotFoundError` or `ReviewAlreadyModeratedError`.

### 6. HTTP contract

| Method + path | Use case | Request | Success |
|---|---|---|---|
| `GET /products/{id}/reviews` | `ProductReviewsGetter` | | 200 `ProductReviewsResponse` |
| `GET /me/reviews/eligibility?productId=` | `ReviewEligibilityChecker` | required `productId` | 200 `ReviewEligibilityResponse` |
| `POST /me/reviews` | `ReviewSubmitter` | `{ productId: string, rating: number, title: string, body: string }` | 201, empty body |
| `GET /reviews/pending` | `PendingReviewsLister` | | 200 `PendingReviewResponse[]` |
| `POST /reviews/{id}/approval` | `ReviewApprover` | empty body | 204 |
| `POST /reviews/{id}/rejection` | `ReviewRejecter` | empty body | 204 |

New error types: 403 `ProductNotPurchasedError` (a new status row); 404 `ReviewNotFoundError`, `ReviewedProductNotFoundError`; 409 `ReviewAlreadyExistsError`, `ReviewAlreadyModeratedError`; 422 `InvalidReviewRatingError`, `InvalidReviewTitleError`, `InvalidReviewBodyError`.

- Approval and rejection are action sub-resources (`POST .../approval`), following `POST /me/checkout/confirmation`, and not a generic `PATCH status`. Each maps to one use case and one intent.
- **Alternative: let the web compute eligibility** from `/me/orders` plus reviews. It would move a business rule into `retail-web` and need extra endpoints. Rejected.

### 7. Product page (`retail-web`)

`src/app/products/[id]/page.tsx` also fetches `productReviewsGetter.get(id)` and `reviewEligibilityChecker.check(id)`, then renders below the product details and above the suggestions:

- `ProductReviews` (presentational, `src/contexts/frontend/retail/sections/`): heading "Reviews", summary ("4.3 out of 5 · 3 reviews") or "No reviews yet", and the list. Each review shows stars (with an accessible label "4 out of 5 stars"), title, body, author and formatted date.
- `ReviewPanel` (`src/app/products/[id]/`) picks the view from the eligibility status:
  - `can-review` → `ReviewForm`.
  - `pending-review` → "Thanks! Your review is awaiting moderation."
  - `already-reviewed` → "You have already reviewed this product."
  - `not-purchased` → nothing.
- `ReviewForm` is a client component (`useActionState`) with a 1–5 star radio group (`fieldset` + `legend`, required), title (`maxLength=100`) and body (`maxLength=2000`) fields, `SubmitButton` and `FormError`.
- The `submitReview` server action (`src/app/actions/reviews/`) reads the fields from `FormData` (with `InvalidFormDataError` for a missing or non-numeric rating). It calls the API, maps errors with `reviewMessages`, and on success calls `revalidatePath("/products/[id]", "page")`. The re-rendered page gets `pending-review` and shows the awaiting-moderation message, so the form needs no client-side success state.
- **Alternative: a success flag in `ActionState`.** It would duplicate a state the API already returns and get lost on reload. Rejected.

### 8. Backoffice moderation (`retail-web`)

- `/admin/reviews` (`src/app/admin/reviews/page.tsx`) fetches `pendingReviewsLister.list()` and renders `PendingReviewsList` (presentational, in `sections/`): one card per review with product name (linking to the product page), author, date, stars, title and body. The empty state is "No reviews awaiting moderation."
- Each card has a client `ModerateReviewForm` (`src/app/admin/reviews/`) with "Approve" and "Reject" buttons. They submit to the `approveReview` / `rejectReview` server actions (hidden `reviewId`), which map `ReviewNotFoundError` and `ReviewAlreadyModeratedError` to messages and call `revalidatePath("/", "layout")`. That refreshes the queue and the product page.
- `AdminNav` gets `{ href: "/admin/reviews", label: "Reviews" }` after "Outfits".
- Cards, not the shared `Table`: review bodies are long text and don't fit table cells.

## Risks / Trade-offs

- [Every customer is the same faked user, so in dev only one customer can review and the "already reviewed" path appears quickly] → Seed reviews come from other users, and the seed leaves the fake user with bought-but-unreviewed products. The tests mock `CurrentUserProvider`.
- [The product page makes two more API calls] → Both are single indexed queries. They run in parallel with `Promise.all` and the suggestions call.
- [Loading all approved reviews to compute the average doesn't scale to thousands of reviews per product] → Fine for today's catalog. A SQL aggregate and pagination can come later without changing the response.
- [The open backoffice means anyone can moderate] → Same exposure as outfits and orders today. Auth is out of scope.
- [The product name copy goes stale if the product is renamed] → The queue is short-lived, and the product page shows the live product anyway.
- [Race between the existing-review check and the insert] → The unique index rejects the second insert, and the repository maps it to `ReviewAlreadyExistsError`.

## Migration Plan

- Add the `reviews` table to `database/schema.sql`. Add seed reviews to `database/seed.sql`: approved, pending and rejected ones by other users, plus a pending one by `user-a1c92f04` on a product they bought, while leaving them at least one bought product with no review. Run `npm run db:reset` and `npm run db:test:reset`.
- Merge and deploy `retail-api` first: the new endpoints are additive. Then merge `retail-web`.
- Rollback: revert the `retail-web` PR (the page stops calling the new endpoints), then the `retail-api` PR, and reset the database.
