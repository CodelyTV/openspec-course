# Proposal

## Why

The product page only shows what the store says about a product. Customers deciding on a size or a fabric can't hear from people who already bought it, and the store gets no structured feedback on its products. Reviews from verified buyers, which staff moderate before they go public, give both without opening the page to spam or abuse.

## What Changes

- New product reviews: a 1–5 star rating, a title and a body, written by a customer about a product.
- Only customers who bought the product (it appears in one of their orders) can review it, once per product. Authors can't edit or delete their reviews.
- Every new review starts as pending. Staff approve or reject it once from a new `/admin/reviews` backoffice section, with a "Reviews" entry in the admin navigation. The section lists pending reviews, oldest first. Moderated reviews leave the queue.
- New "Reviews" section on the product page (`/products/[id]`): average rating and number of approved reviews, and every approved review, newest first. Customers never see pending or rejected reviews.
- Review form on the product page, shown only to customers who bought the product and have not reviewed it yet. After they submit, they see that their review is awaiting moderation. A customer who already reviewed the product sees that instead of the form. A customer who did not buy it sees no form.
- `retail-api`: new `reviews` bounded context, a `reviews` table, and new endpoints for reading, submitting and moderating reviews. `retail-web`: new product page sections, the review form and the moderation screen.

## Capabilities

### New Capabilities
- `product-reviews`: who can review a product and what a valid review is, plus what customers see on the product page (approved reviews, rating summary, review form and its states).
- `review-moderation`: the pending → approved/rejected lifecycle of a review and the backoffice queue staff use to moderate.

### Modified Capabilities

None. The product page suggestions (`product-suggestions`) stay as they are; reviews are a separate section.

## Impact

- **retail-api**: new `src/contexts/backend/reviews/` context (domain, use cases, Postgres repository), consumer-owned ports adapted to `orders` (purchase check), `products` (reviewed product) and `users` (author names). Needs a small new use case in `orders` and `reviews` added to the ESLint context boundaries. Also `RetailContainer` wiring, new route handlers, a `reviews` table in `database/schema.sql` with seed data, and updates to `docs/http/contract.md` (endpoints and error types) and `docs/sql-database/data-model.md`.
- **retail-web**: new `RetailApi` methods and response types, server actions for submitting and moderating reviews, a "Reviews" section and review form on `/products/[id]`, the new `/admin/reviews` page, a "Reviews" link in `AdminNav`, and updates to `docs/architecture/screens.md`.
- No authentication changes: the customer is still the faked current user, and the backoffice stays open as it is today.
