# SQL database: Data model

PostgreSQL runs in Docker (see `compose.yml`). Schema and seed data live in `database/schema.sql` and `database/seed.sql`; the `db:reset` npm script applies both.

## Tables

- `products`, `product_variants` — catalog; variants carry size/color and `online_stock` (`check (online_stock >= 0)`).
- `outfits`, `outfit_products` — admin-curated looks (`Outfit` aggregate in the `products` context). `outfits.name` is unique ignoring case (unique index on `lower(name)`). `outfit_products` keeps the admin's order in `position`; its primary key `(outfit_id, product_id)` forbids repeating a product, and both foreign keys are `on delete cascade`, so a product removed from the catalog leaves every outfit while the outfit itself is kept (possibly with fewer than 2 products).
- `restock_alerts` — customers waiting for a sold-out variant to be back (`RestockAlert` in the `products` context), with the `requested_at` time. Its primary key `(user_id, variant_id)` allows one alert per customer and variant, and the repository saves with `on conflict do nothing`, so asking again keeps the existing alert. Both foreign keys are `on delete cascade`: removing a user or a variant removes its alerts. Alerts are only recorded and counted (inventory "Waiting" column); nothing sends or consumes them yet.
- `checkouts`, `checkout_lines` — in-progress carts. One checkout per user (`user_id` unique). `version` is an optimistic lock: every save bumps it and fails with `CheckoutConcurrentModificationError` if it changed since the checkout was read.
- `orders`, `order_lines` — confirmed purchases. Each order line snapshots what was bought when the order was placed (`product_name`, `color`, `size` and `unit_price_amount`), so order history doesn't change when the catalog does. `product_id` and `variant_id` are kept as plain references without foreign keys: products can be renamed or deleted without rewriting or breaking past orders.
- `users` — customers (no auth: the current user is faked, see `FakeSessionCurrentUserProvider`).
- Line quantities are `check (quantity > 0)` in `checkout_lines` and `order_lines`.

## Conventions

- Schema changes go into `database/schema.sql` (there is no migrations tool); re-apply with `npm run db:reset` and `npm run db:test:reset`.
- Access goes through the repositories in each context's `infrastructure/` layer, never raw SQL from `src/app/`.
- Stock is only decreased with a guarded update (`... where online_stock >= $quantity`), never read-then-write.
- Confirming a checkout runs in one transaction (`UnitOfWork`): it locks the checkout row (`select ... for update`), decreases stock, places the order and empties the cart.
