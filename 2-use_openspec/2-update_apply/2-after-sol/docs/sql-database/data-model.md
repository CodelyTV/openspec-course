# SQL database: Data model

PostgreSQL runs in Docker (see `compose.yml`). Schema and seed data live in `database/schema.sql` and `database/seed.sql`; the `db:reset` npm script applies both.

## Tables

- `products`, `product_variants` — catalog; variants carry size/color and `online_stock` (`check (online_stock >= 0)`).
- `checkouts`, `checkout_lines` — in-progress carts. One checkout per user (`user_id` unique). `version` is an optimistic lock: every save bumps it and fails with `CheckoutConcurrentModificationError` if it changed since the checkout was read.
- `orders`, `order_lines` — confirmed purchases. Each order line snapshots what was bought when the order was placed (`product_name`, `color`, `size` and `unit_price_amount`), so order history doesn't change when the catalog does. `product_id` and `variant_id` are kept as plain references without foreign keys: products can be renamed or deleted without rewriting or breaking past orders.
- `outfits`, `outfit_products` — named, ordered combinations of 2–4 distinct products. `outfits_name_unique` enforces unique names using `lower(btrim(name))`; display casing is retained. Pieces have unique positions and cascade on outfit deletion, with no foreign key to products because they belong to another context. Saves replace pieces in a transaction; name conflicts roll back the whole save.
- `users` — customers (no auth: the current user is faked, see `FakeSessionCurrentUserProvider`).
- Line quantities are `check (quantity > 0)` in `checkout_lines` and `order_lines`.

## Conventions

- Schema changes go into `database/schema.sql` (there is no migrations tool); re-apply with `npm run db:reset` and `npm run db:test:reset`.
- Access goes through the repositories in each context's `infrastructure/` layer, never raw SQL from `src/app/`.
- Stock is only decreased with a guarded update (`... where online_stock >= $quantity`), never read-then-write.
- Confirming a checkout runs in one transaction (`UnitOfWork`): it locks the checkout row (`select ... for update`), decreases stock, places the order and empties the cart.
