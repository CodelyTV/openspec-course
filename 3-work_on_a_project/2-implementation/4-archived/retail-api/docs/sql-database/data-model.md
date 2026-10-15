# SQL database: Data model

PostgreSQL runs in Docker (see `compose.yml`). Schema and seed data live in `database/schema.sql` and `database/seed.sql`; the `db:reset` npm script applies both.

## Tables

- `products`, `product_variants` — catalog; variants carry size/color and `online_stock` (`check (online_stock >= 0)`).
- `outfits`, `outfit_products` — admin-curated looks (`Outfit` aggregate in the `products` context). `outfits.name` is unique ignoring case (unique index on `lower(name)`). `outfit_products` keeps the admin's order in `position`; its primary key `(outfit_id, product_id)` forbids repeating a product, and both foreign keys are `on delete cascade`, so a product removed from the catalog leaves every outfit while the outfit itself is kept (possibly with fewer than 2 products).
- `checkouts`, `checkout_lines` — in-progress carts. One checkout per user (`user_id` unique). `version` is an optimistic lock: every save bumps it and fails with `CheckoutConcurrentModificationError` if it changed since the checkout was read.
- `orders`, `order_lines` — confirmed purchases. Each order line snapshots what was bought when the order was placed (`product_name`, `color`, `size` and `unit_price_amount`), so order history doesn't change when the catalog does. `product_id` and `variant_id` are kept as plain references without foreign keys: products can be renamed or deleted without rewriting or breaking past orders.
- `reviews` — customer reviews of products (`Review` aggregate in the `reviews` context). `product_id` has no foreign key, like `order_lines`, so removing a product from the catalog neither fails nor deletes its reviews; `product_name` is copied when the review is written. One review per customer and product (unique index on `(product_id, user_id)`, mapped to `ReviewAlreadyExistsError`). `rating` is `check (rating between 1 and 5)` and `status` is `check (status in ('pending', 'approved', 'rejected'))`. Moderation is a guarded update (`... where status = 'pending'`), so a review is moderated once.
- `users` — customers (no auth: the current user is faked, see `FakeSessionCurrentUserProvider`).
- Line quantities are `check (quantity > 0)` in `checkout_lines` and `order_lines`.

## Conventions

- Schema changes go into `database/schema.sql` (there is no migrations tool); re-apply with `npm run db:reset` and `npm run db:test:reset`.
- Access goes through the repositories in each context's `infrastructure/` layer, never raw SQL from route handlers in `src/app/`.
- Stock is only decreased with a guarded update (`... where online_stock >= $quantity`), never read-then-write.
- Confirming a checkout runs in one transaction (`UnitOfWork`): it locks the checkout row (`select ... for update`), decreases stock, places the order and empties the cart.
