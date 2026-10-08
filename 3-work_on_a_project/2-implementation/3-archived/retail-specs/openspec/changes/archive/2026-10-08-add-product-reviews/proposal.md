# Proposal

## Why

The product page only shows what the store says about a product. Customers deciding on a size or a fabric have no way to hear from people who already bought it, and the store gets no structured feedback on its products. Reviews from verified buyers, moderated by staff before they go public, give both without opening the page to spam or abuse.

## What Changes

- Introduce **product reviews**: a 1–5 star rating, a title and a body, written by a customer about a product.
- Only customers who have bought the product (it appears in one of their orders) can review it, and each customer can review a product only once. Reviews cannot be edited or deleted by their author.
- Every new review starts **pending**. Staff **approve** or **reject** it from a new `/admin/reviews` section (with a "Reviews" entry in the admin navigation) that lists pending reviews, oldest first. A review is moderated once: approved and rejected reviews leave the queue.
- Product page (`/products/[id]`): a new "Reviews" section shows the average rating and number of approved reviews, and every approved review (newest first). Pending and rejected reviews are never shown to customers.
- Product page review form: shown to customers who bought the product and have not reviewed it yet. After submitting, the customer sees that their review is awaiting moderation; a customer who already reviewed the product sees that instead of the form; a customer who did not buy the product sees no form.
- **retail-api**: a new `reviews` bounded context with its table, use cases and six new endpoints; `docs/http/contract.md` gains them and their error types.
- **retail-web**: the product page reviews section and form, the `/admin/reviews` moderation page, server actions and `RetailApi` methods for the new endpoints.

## Capabilities

### New Capabilities
- `product-reviews`: What customers can review and how reviews are shown on the product page — who may review a product, what a valid review is, one review per customer and product, and the approved reviews with their average rating.
- `review-moderation`: How staff moderate reviews in the backoffice — the pending queue, approving and rejecting, and which reviews become public.

### Modified Capabilities
<!-- None: product-suggestions, outfit-management and stock-monitoring keep their requirements; the reviews section is added next to the suggestions without changing them. -->

## Impact

- **retail-api**:
  - **Database**: new `reviews` table in `database/schema.sql` (one row per customer and product), seed reviews in `database/seed.sql`, documented in `docs/sql-database/data-model.md`.
  - **Backend**: new `reviews` bounded context (`Review` aggregate, `ReviewRepository` and its Postgres adapter, use cases for submitting, listing, eligibility and moderation). It reaches Orders (did the customer buy the product?) and Users (author name) through ports adapted to their `application/` use cases; Orders gains a small use case for that. `reviews` is added to the ESLint context boundaries and `RetailContainer` wires everything.
  - **HTTP contract**: new endpoints `GET /products/{id}/reviews`, `GET /me/products/{id}/review-eligibility`, `POST /me/reviews`, `GET /reviews/pending`, `POST /reviews/{id}/approval`, `POST /reviews/{id}/rejection`, and new error types (403 status included), all added to `docs/http/contract.md`.
- **retail-web**: new response types and `RetailApi` methods, product page reviews section and form, `/admin/reviews` page and `AdminNav` entry, review server actions; `docs/architecture/screens.md` updated.
- No new dependencies. No breaking changes to existing endpoints.
