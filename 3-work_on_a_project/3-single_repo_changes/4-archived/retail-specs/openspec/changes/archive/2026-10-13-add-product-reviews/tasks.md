# Tasks

## 1. Database (retail-api)

- [x] 1.1 Add the `reviews` table and its indexes (unique `(product_id, user_id)`, `(product_id, status)`, `(status, created_at)`) to `database/schema.sql` as in design.md §4, and verify `npm run db:reset` and `npm run db:test:reset` succeed
- [x] 1.2 Add seed reviews to `database/seed.sql`: approved reviews by several users on one product with mixed ratings, one pending, one rejected, and a pending review by `user-a1c92f04` on a product they bought, while leaving them at least one bought product with no review. Verify `npm run db:reset` loads them and a query shows the fake user has both a reviewed and an unreviewed bought product
- [x] 1.3 Make `RetailEnvironmentArranger` clean `reviews` between integration tests and verify `npm run test:integration` still passes
- [x] 1.4 Document `reviews` in `docs/sql-database/data-model.md` (no FK to products, copied `product_name`, one review per customer and product, status check) and verify it matches `schema.sql`

## 2. Purchase check in orders (retail-api)

- [x] 2.1 Add `Order.includesProduct(productId)` and the `ProductPurchaseChecker` use case (`orders/application/check-purchase/`, `hasBought(userId, productId)` over `searchByUser`), and verify its unit test covers no orders, orders without the product, and the product bought in another variant or in an older order

## 3. Reviews domain and repository (retail-api)

- [x] 3.1 Add `reviews` to `backendContexts` in `eslint.config.mjs` and create `ReviewId`, `ReviewRating`, `ReviewStatus`, the `Review` aggregate (`create` with validation, `approve`, `reject`, `fromPrimitives` without validation) and the domain errors from design.md §2. Verify `npm run typecheck` and `npm run lint` pass
- [x] 3.2 Declare the `ReviewRepository`, `PurchaseHistory`, `ReviewedProducts` and `ReviewerDirectory` (+ `ReviewerNames`) ports, and add `ReviewMother` in `tests/backend/reviews/domain/`. Verify `npm run typecheck` passes
- [x] 3.3 Implement `PostgresReviewRepository`: insert, guarded moderation update throwing `ReviewAlreadyModeratedError`, unique violation mapped to `ReviewAlreadyExistsError`, and searches ordered in SQL. Verify its integration test covers save and search, search by product and author, approved-only newest first, pending-only oldest first, the duplicate insert, and moderating a review that is not pending
- [x] 3.4 Implement the `OrdersPurchaseHistory`, `ProductsReviewedProducts` and `UsersReviewerDirectory` adapters, and verify `npm run lint` reports no boundary violations

## 4. Reviews use cases and HTTP (retail-api)

- [x] 4.1 Implement `ReviewSubmitter` and verify its unit tests cover every scenario of "Review content", "Only buyers can review", "One review per customer and product" and "New reviews start pending", plus `ReviewedProductNotFoundError`
- [x] 4.2 Implement `ReviewEligibilityChecker` and verify its unit tests cover `not-purchased`, `can-review`, `pending-review`, and `already-reviewed` for both approved and rejected reviews
- [x] 4.3 Implement `ProductReviewsGetter` and verify its unit tests cover approved-only reviews, the author names, the average of 5, 4 and 4 → 4.3 with count 3, and `averageRating: null` with no approved reviews
- [x] 4.4 Implement `PendingReviewsLister`, `ReviewApprover` and `ReviewRejecter`. Verify their unit tests cover the response fields, approve, reject, `ReviewNotFoundError` and `ReviewAlreadyModeratedError`
- [x] 4.5 Wire the reviews repository, adapters and use cases (plus `ProductPurchaseChecker`) in `RetailContainer`, and verify `npm run build` succeeds
- [x] 4.6 Add the route handlers from design.md §6 and register the new error types and statuses (including 403) in `httpErrorResponse.ts`. Verify the `tests/app/**/route.spec.ts` files cover each happy path, the 400 for a missing `productId` or bad body, and each mapped error status
- [x] 4.7 Add the endpoints and error rows to `docs/http/contract.md` and verify every new route and error type is listed
- [x] 4.8 Add an acceptance test (`tests/backend/acceptance/ProductReview.spec.ts`) that places an order, submits a review, approves it and reads it from `ProductReviewsGetter`. Verify `npm run test:integration` passes

## 5. Product page reviews (retail-web)

- [x] 5.1 Add the `ProductReviewsResponse`, `ReviewEligibilityResponse` and `PendingReviewResponse` types and the `RetailApi` methods (`productReviewsGetter`, `reviewEligibilityChecker`, `reviewSubmitter`, `pendingReviewsLister`, `reviewApprover`, `reviewRejecter`). Verify `RetailApi.spec.ts` covers their URL, method, body and error mapping
- [x] 5.2 Add response mothers for the new types and build `ProductReviews` (summary, list with accessible star labels, "No reviews yet"). Verify its frontend test covers the summary, the order as received, and the empty state
- [x] 5.3 Add the `submitReview` server action and `reviewMessages` in `src/app/actions/reviews/`. Verify its unit test covers the API call, `revalidatePath`, invalid form data and each review error type
- [x] 5.4 Build the client `ReviewForm` (star radio group, title, body) and `ReviewPanel` (the four eligibility states). Verify their frontend tests cover submit, error and pending states, and each panel state, including rendering nothing for `not-purchased`
- [x] 5.5 Wire `ProductReviews` and `ReviewPanel` into `src/app/products/[id]/page.tsx`, fetching reviews and eligibility in parallel. Update `/products/[id]` in `docs/architecture/screens.md`, and verify in `npm run dev` with the seed data: the form on a bought, unreviewed product; the awaiting message after submitting; nothing on a product never bought

## 6. Backoffice moderation (retail-web)

- [x] 6.1 Add the `approveReview` and `rejectReview` server actions with messages for `ReviewNotFoundError` and `ReviewAlreadyModeratedError`. Verify their unit tests cover the API calls, `revalidatePath` and both errors
- [x] 6.2 Build `PendingReviewsList` (cards with product link, author, date, stars, title, body, empty state) and the client `ModerateReviewForm` (Approve and Reject). Verify their frontend tests cover rendering, the empty state, each button's action, and the error and pending states
- [x] 6.3 Add `/admin/reviews` and the "Reviews" `AdminNav` entry, list the route in `docs/architecture/screens.md`, and verify `AdminNav.spec.tsx` covers the new link. In `npm run dev`, check that approving a review shows it on its product page and rejecting it removes it from the queue

## 7. Integration checks

- [x] 7.1 Run `make checks` and `npm run test:integration` in `retail-api` and `make checks` in `retail-web`, and verify all pass

## Workflow follow-up

- Branch `add-product-reviews` in `retail-specs`, `retail-api` and `retail-web`.
- Open one PR per code repo, linked to each other. Merge `retail-api` before `retail-web`.
- Once both are merged, archive the change and open the archive PR in `retail-specs`.
