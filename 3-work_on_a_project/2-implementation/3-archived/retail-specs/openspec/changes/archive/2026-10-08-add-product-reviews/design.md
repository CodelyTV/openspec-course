# Design

## Context

See proposal.md for motivation and specs/ for the required behavior.

- **Repos touched**: both.
  - `retail-api` owns the data and the rules (who can review, one review per customer and product, moderation), so it gets the new table, a new bounded context and the endpoints.
  - `retail-web` has no database or business logic: it only renders the reviews section and form on the product page and the moderation page in `/admin`, calling the new endpoints through `RetailApi`.
- `retail-api` contexts today: `products`, `checkout`, `orders`, `users`. Contexts collaborate through consumer-owned ports adapted to the provider's `application/` use cases; ESLint enforces it with the `backendContexts` list in `eslint.config.mjs`.
- Purchases live in `orders`: `OrderRepository.searchByUser(userId)` returns the user's orders with their lines, and each `OrderLine` snapshots `productId` and `productName`.
- The current user is resolved inside the API (`CurrentUserProvider`, faked by `FakeSessionCurrentUserProvider`); `/me/**` endpoints never receive a user id. The backoffice has no authentication.
- Schema changes go into `database/schema.sql` (no migrations tool) and are applied with `db:reset` / `db:test:reset`.
- `retail-web` server actions return an `ActionState` and map API error `type`s to user-facing messages through `actionStateFor`; response types are copied from the contract into `responses.ts`.

## Goals / Non-Goals

**Goals:**
- Keep every review rule in `retail-api` use cases and the `Review` aggregate, unit-tested; `retail-web` only shows what the API decides (including whether to show the form).
- Reach Orders and Users only through ports adapted to their use cases, without new cycles between contexts.
- Pin the new endpoints and error types in `docs/http/contract.md` before `retail-web` consumes them.

**Non-Goals:**
- Editing or deleting a review by its author, or re-moderating an already moderated review.
- Pagination or sorting options for reviews on the product page or in the moderation queue.
- Notifications (to the customer when a review is moderated, or to staff when one is submitted).
- Showing the average rating outside the product page (catalog cards, search).
- Authentication or roles for the backoffice (it is open today and stays so).
- Replies, helpful votes, photos or reporting abusive reviews.

## Decisions

### 1. Product decisions

Taken without the user, recorded here so they can be challenged in the plan PR:

- **Who can review**: any customer with at least one order containing the product, whatever the variant or date. There is a single order status (`confirmed`), so no delivery check.
- **One review per customer and product, forever**: a rejected review still counts, so a customer cannot spam the queue by resubmitting. No editing or deleting.
- **Content limits**: rating 1–5 whole stars; title 1–100 characters; body 1–2000 characters, both trimmed.
- **Moderation is one-shot**: only pending reviews can be approved or rejected. The queue only shows pending reviews, oldest first (first come, first served).
- **Public data**: the author's name as stored in `users` and the review date. No email.
- **Average**: over approved reviews only, rounded to one decimal; with none, no average is shown.
- **Product page order**: newest approved review first, all of them (no pagination; review volume is low with today's catalog).

### 2. A new `reviews` bounded context in retail-api

`src/contexts/backend/reviews/` with `domain/`, `application/` and `infrastructure/`, added to `backendContexts` in `eslint.config.mjs`.

- **Alternative: inside `products`.** Reviews would need Orders and Users, adding a dependency from the catalog to orders and mixing moderation with catalog code. Rejected.
- Reviews have their own lifecycle (pending → approved/rejected) and nobody else depends on them, so a separate context depends on `orders` and `users` without creating cycles.

`ReviewId` stays local to `reviews`; `ProductId` and `UserId` come from the shared kernel.

### 3. Domain model

- `Review` aggregate: `id`, `productId`, `userId`, `productName`, `authorName`, `rating`, `title`, `body`, `status` (`pending | approved | rejected`), `createdAt`.
  - `Review.submit(...)` validates content and starts as `pending`. Value objects `ReviewRating`, `ReviewTitle`, `ReviewBody` throw `InvalidReviewRatingError`, `InvalidReviewTitleError`, `InvalidReviewBodyError`.
  - `approve()` / `reject()` throw `ReviewAlreadyModeratedError` unless the review is pending.
  - `fromPrimitives` does not validate.
- `productName` and `authorName` are **snapshots** taken when the review is submitted, following the "copy data when it happens" rule of `docs/architecture/hexagonal-architecture.md`. The moderation queue and the product page then read one table, without calling other contexts.
- `ReviewRepository` port: `save`, `search(id)`, `searchByUserAndProduct(userId, productId)`, `searchApprovedByProduct(productId)` (newest first), `searchPending()` (oldest first).
- Consumer-owned ports and their adapters:
  - `PurchaseHistory.purchasedProduct(userId, productId): Promise<PurchasedProduct | null>` (`{ productId, productName }`) → `OrdersPurchaseHistory` over a new Orders use case `PurchasedProductFinder` (`orders/application/find-purchased-product/`). It uses the existing `OrderRepository.searchByUser` and returns the line's snapshotted name from the most recent order containing the product, or `null`. No new SQL in Orders.
  - `ReviewAuthors.nameOf(userId): Promise<string>` → `UsersReviewAuthors` over the existing `UsersByIdsSearcher`.
- Errors: `ProductNotPurchasedError`, `ReviewAlreadyExistsError`, `ReviewNotFoundError`, `ReviewAlreadyModeratedError` plus the three content errors.
- **Alternative: resolve product and author names when listing**, like `OrdersLister` does with `CustomerDirectory`. It needs two cross-context calls on every product page view, for data that does not need to stay live. Rejected.

### 4. Use cases (retail-api)

| Use case | Folder | Behavior |
|---|---|---|
| `ReviewSubmitter` | `application/submit/` | Current user → `PurchaseHistory` (`ProductNotPurchasedError` when `null`) → `searchByUserAndProduct` (`ReviewAlreadyExistsError`) → `ReviewAuthors` → `Review.submit` with id from `IdGenerator` and date from `Clock` → `save` |
| `ReviewEligibilityChecker` | `application/check-eligibility/` | Current user's review for the product, else whether they bought it; returns `ReviewEligibilityResponse` |
| `ProductReviewsFinder` | `application/find-for-product/` | Approved reviews newest first, `reviewCount` and `averageRating` (one decimal, `null` when none) |
| `PendingReviewsLister` | `application/list-pending/` | Pending reviews oldest first |
| `ReviewApprover` | `application/approve/` | `search` (`ReviewNotFoundError`) → `approve()` → `save` |
| `ReviewRejecter` | `application/reject/` | `search` (`ReviewNotFoundError`) → `reject()` → `save` |

All registered in `RetailContainer`, together with `PostgresReviewRepository`, `OrdersPurchaseHistory`, `UsersReviewAuthors` and `PurchasedProductFinder`.

### 5. Persistence

```sql
create table reviews (
	id text primary key,
	product_id text not null,
	user_id text not null references users(id) on delete cascade,
	product_name text not null,
	author_name text not null,
	rating integer not null check (rating between 1 and 5),
	title text not null,
	body text not null,
	status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
	created_at timestamptz not null default now(),
	unique (user_id, product_id)
);

create index reviews_product_id_status_idx on reviews(product_id, status);
```

- `unique (user_id, product_id)` is the safety net for "one review per customer and product" when two submissions race; `PostgresReviewRepository` maps the unique violation to `ReviewAlreadyExistsError`.
- `product_id` has no foreign key, like `order_lines`: reviews hold a snapshot and the product page of a removed product no longer exists anyway.
- `seed.sql` gets a few reviews on products the seeded users bought: approved ones on two or three products (to see the average), plus pending reviews for the queue. The faked current user (`user-a1c92f04`) keeps at least one bought product without a review, so the form can be tried locally.

### 6. HTTP contract changes (retail-api)

New endpoints, documented in `docs/http/contract.md`:

| Method + path | Use case | Request | Success |
|---|---|---|---|
| `GET /products/{id}/reviews` | `ProductReviewsFinder` | | 200 `ProductReviewsResponse` (no reviews and `averageRating: null` for an unknown product) |
| `GET /me/products/{id}/review-eligibility` | `ReviewEligibilityChecker` | | 200 `ReviewEligibilityResponse` |
| `POST /me/reviews` | `ReviewSubmitter` | `{ productId: string, rating: number, title: string, body: string }` | 201, empty body |
| `GET /reviews/pending` | `PendingReviewsLister` | | 200 `PendingReviewResponse[]` |
| `POST /reviews/{id}/approval` | `ReviewApprover` | empty body | 204 |
| `POST /reviews/{id}/rejection` | `ReviewRejecter` | empty body | 204 |

```ts
type ReviewResponse = { id: string; authorName: string; rating: number; title: string; body: string; createdAt: string };
type ProductReviewsResponse = { averageRating: number | null; reviewCount: number; reviews: ReviewResponse[] };
type ReviewEligibilityResponse = { status: "can-review" | "not-purchased" | "awaiting-moderation" | "already-reviewed" };
type PendingReviewResponse = ReviewResponse & { productId: string; productName: string };
```

New error types in `httpErrorResponse.ts` and the contract's error table:

| Status | `type` |
|---|---|
| 403 (new status) | `ProductNotPurchasedError` |
| 404 | `ReviewNotFoundError` |
| 409 | `ReviewAlreadyExistsError`, `ReviewAlreadyModeratedError` |
| 422 | `InvalidReviewRatingError`, `InvalidReviewTitleError`, `InvalidReviewBodyError` |

- `POST /me/reviews` needs a `requiredNumber(body, field)` helper in `requestBody.ts` (400 `InvalidArgumentError` when `rating` is not a number). Whether it is a whole number from 1 to 5 is a domain rule (422).
- `ProductNotPurchasedError` is 403 because the request is valid but this customer is not allowed to do it. A 422 would hide that difference from the client.
- Moderation uses two action resources (`/approval`, `/rejection`) like `/me/checkout/confirmation`. **Alternative: `PATCH /reviews/{id}` with `{ status }`.** It would let clients set any status, including back to `pending`. Rejected.
- `/reviews/pending` is not under `/me`: it is a backoffice endpoint, like `/orders`.
- No existing endpoint changes: no breaking change for `retail-web`.

### 7. Product page (retail-web)

- `src/app/products/[id]/page.tsx` fetches `productReviewsFinder.find` and `reviewEligibilityChecker.check` in parallel with the suggestions and renders a "Reviews" section below the purchase area, above the suggestions.
- `ProductReviews` (presentational, `src/contexts/frontend/retail/sections/`) renders the average ("4.3 out of 5", stars), the count ("3 reviews"), the list (rating, title, body, author, date via `formatLongDate`) and the "No reviews yet" empty state. Stars come from a small `StarRating` component with an `aria-label` such as "4 out of 5 stars".
- `ReviewPanel` (`src/app/products/[id]/`) picks what to show from `ReviewEligibilityResponse`:
  - `can-review` → `ReviewForm`;
  - `awaiting-moderation` → "Thanks! Your review is awaiting moderation.";
  - `already-reviewed` → "You already reviewed this product.";
  - `not-purchased` → nothing.
- `ReviewForm` is a client component (`useActionState(submitReview)`) with a radio group for the 1–5 stars, a title input (`maxLength=100`), a body textarea (`maxLength=2000`), a hidden `productId`, and `FormError` + `SubmitButton`. React resets uncontrolled forms after a form action, so the fields are controlled state: an error keeps what the customer typed.
- `submitReview` (`src/app/actions/reviews/`) reads the fields from `FormData` (`InvalidFormDataError` when missing), calls `reviewSubmitter.submit`, then `revalidatePath` of the product page. The page re-renders with `awaiting-moderation`, so the form is replaced without a redirect. `reviewMessages.ts` maps every review error type to the messages of the specs.
- **Alternative: decide whether to show the form in the page** from `/me/orders`. It would duplicate the "bought it and has no review" rule in `retail-web`. Rejected: the eligibility endpoint keeps it in the API.

### 8. Moderation page (retail-web)

- `/admin/reviews` (`src/app/admin/reviews/page.tsx`) lists `pendingReviewsLister.list()` with `PendingReviewsList`: product name, author, date, stars, title, body and an empty state ("No reviews to moderate").
- Each review has a `ModerateReviewForm` (client, `useActionState`) with "Approve" and "Reject" buttons.
  - They post to `approveReview` / `rejectReview` (`src/app/actions/reviews/`), which call the API and then `revalidatePath("/", "layout")`, so the queue and the product page refresh.
  - `ReviewAlreadyModeratedError` and `ReviewNotFoundError` show their message next to the review.
- `AdminNav` gets a "Reviews" entry. `docs/architecture/screens.md` documents `/admin/reviews` and the product page section.

## Risks / Trade-offs

- [Approve and reject arriving at the same instant both read `pending`, and the last write wins] → Acceptable for a small backoffice. The sequential case (spec scenario) is caught by the aggregate. If it matters later, `save` can become a guarded `update ... where status = 'pending'`.
- [Snapshotted author and product names go stale after a rename] → Accepted, as with order lines; reviews describe the product as bought.
- [Full author names are public on the product page] → Users are fake and there is no profile setting; revisit when real accounts exist.
- [Loading every approved review and averaging in memory] → Fine at today's volume. It can move to SQL (`avg`, `count`) behind the same use case without changing the contract.
- [The backoffice has no authentication, so anyone can moderate] → Same as every `/admin` page today; out of scope.
- [`PurchasedProductFinder` loads all of a user's orders to answer one question] → Users have few orders. A dedicated query can replace it without changing the port.

## Migration Plan

- Merge the retail-api PR first (contract, table, endpoints), then retail-web.
- Add the table and seed reviews, then run `npm run db:reset` and `npm run db:test:reset` in retail-api. No data to migrate.
- Rollback: revert the retail-web PR, then the retail-api one, and reset the database. Existing endpoints are untouched, so the old web keeps working against the new API.
