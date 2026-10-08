# Tasks

## retail-api

- [ ] 1.1 Add the `reviews` table and index from design.md §5 to `database/schema.sql` (and its `drop table`), seed reviews in `database/seed.sql` (approved reviews on 2–3 products, a few pending ones, and a bought product left unreviewed for `user-a1c92f04`), document the table in `docs/sql-database/data-model.md`, and verify `npm run db:reset` and `npm run db:test:reset` succeed
- [ ] 1.2 Add `reviews` to `backendContexts` in `eslint.config.mjs` and verify `npm run lint` passes
- [ ] 1.3 Create the `reviews` domain: `ReviewId`, `ReviewRating`, `ReviewTitle`, `ReviewBody`, the `Review` aggregate (`submit`, `approve`, `reject`, `fromPrimitives`, `toPrimitives`), the `ReviewRepository`, `PurchaseHistory` and `ReviewAuthors` ports and the errors from design.md §3, plus `ReviewMother` in `tests/backend/reviews/domain/`, and verify `npm run typecheck` passes
- [ ] 1.4 Implement `PostgresReviewRepository` (unique violation mapped to `ReviewAlreadyExistsError`) and verify its integration test covers save and update of status, `search`, `searchByUserAndProduct`, `searchApprovedByProduct` (only approved, newest first), `searchPending` (oldest first) and the duplicate customer + product case
- [ ] 1.5 Add the Orders use case `PurchasedProductFinder` (`orders/application/find-purchased-product/`, on `OrderRepository.searchByUser`), and the adapters `OrdersPurchaseHistory` and `UsersReviewAuthors` in `reviews/infrastructure/`, and verify the `PurchasedProductFinder` unit test covers a product bought in several orders (name from the most recent), a product never bought and a user with no orders
- [ ] 1.6 Implement `ReviewSubmitter` and verify its unit tests cover every scenario of "Only buyers can review a product", "One review per customer and product", "Review content" (including trimming) and "New reviews await moderation"
- [ ] 1.7 Implement `ReviewEligibilityChecker` and `ProductReviewsFinder` and verify their unit tests cover the four eligibility statuses, approved reviews newest first, pending and rejected reviews excluded, the 4.3 average from the "Average rating" scenario, and `averageRating: null` with no approved reviews
- [ ] 1.8 Implement `PendingReviewsLister`, `ReviewApprover` and `ReviewRejecter` and verify their unit tests cover every review-moderation scenario (oldest first, moderated reviews excluded, approve, reject, already moderated, not found)
- [ ] 1.9 Register the new use cases, repository and adapters in `RetailContainer`, add the error mappings to `httpErrorResponse.ts` (403, 404, 409 and 422 as in design.md §6) and `requiredNumber` to `requestBody.ts`, and verify `npm run build` succeeds
- [ ] 1.10 Add the route handlers `products/[id]/reviews`, `me/products/[id]/review-eligibility`, `me/reviews`, `reviews/pending`, `reviews/[id]/approval` and `reviews/[id]/rejection`, and verify their route specs in `tests/app/` cover the happy path, a non-number `rating` (400), and each error type → status mapping
- [ ] 1.11 Update `docs/http/contract.md` with the six new endpoints, their request/response shapes and the new error types (including the new 403 row), and verify every route added in 1.10 and every error added in 1.9 is listed
- [ ] 1.12 Run `npm run typecheck`, `npm run lint`, `npm run test` and `npm run test:integration` from `retail-api` and verify all pass

## retail-web

- [ ] 2.1 Add `ReviewResponse`, `ProductReviewsResponse`, `ReviewEligibilityResponse` and `PendingReviewResponse` to `responses.ts` (copied from the updated contract), their response mothers in `tests/frontend/retail/responses/`, and the `RetailApi` methods `productReviewsFinder`, `reviewEligibilityChecker`, `reviewSubmitter`, `pendingReviewsLister`, `reviewApprover` and `reviewRejecter`, and verify `RetailApi.spec.ts` asserts URL, method and body for each
- [ ] 2.2 Add the `submitReview`, `approveReview` and `rejectReview` server actions and `reviewMessages.ts` in `src/app/actions/reviews/`, and verify their unit tests assert the API call, the revalidated path and the `ActionState` message for every review error type
- [ ] 2.3 Build `StarRating` and the presentational `ProductReviews` section (average, count, approved reviews with author and date, "No reviews yet") in `src/contexts/frontend/retail/sections/`, and verify their frontend tests cover a product with reviews, the average label and the empty state
- [ ] 2.4 Build `ReviewForm` (star radio group, title, body, error and pending states) and `ReviewPanel` (form, "awaiting moderation", "already reviewed" or nothing) in `src/app/products/[id]/`, and verify their frontend tests, mocking the actions module, cover submitting, an error message keeping the values, and each eligibility status
- [ ] 2.5 Render the reviews section and `ReviewPanel` on `src/app/products/[id]/page.tsx` (fetching reviews and eligibility in parallel with the suggestions), and verify in `npm run dev` with the seed data that a review submitted by the current user shows as awaiting moderation and is not listed
- [ ] 2.6 Add the `/admin/reviews` page with `PendingReviewsList` and `ModerateReviewForm` (Approve / Reject, error next to the review) and the "Reviews" `AdminNav` entry, and verify frontend tests cover the list, the empty state, both buttons and an error message, and `AdminNav.spec.tsx` covers the new link
- [ ] 2.7 Document `/admin/reviews` and the product page reviews section in `docs/architecture/screens.md`, and verify in `npm run dev` that approving a pending review shows it on its product page with the updated average and rejecting one hides it
- [ ] 2.8 Run `npm run typecheck`, `npm run lint` and `npm run test` from `retail-web` and verify all pass

## Workflow follow-up

- Open the retail-specs PR with this plan and merge it before the code PRs.
- Open one PR per repo on the `add-product-reviews` branch (retail-api first), linking each other and the plan.
- Once both code PRs are merged, archive the change and open the archive PR in retail-specs.
