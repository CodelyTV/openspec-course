# SQL database: Data model

PostgreSQL runs in Docker (see `compose.yml`). Schema and seed data live in `database/schema.sql` and `database/seed.sql`; the `db:reset` npm script applies both.

## Tables

- `products`, `product_variants` — catalog; variants carry size/color and `online_stock` (`check (online_stock >= 0)`).
- `checkouts`, `checkout_lines` — in-progress carts. One checkout per user (`user_id` unique). `version` is an optimistic lock: every save bumps it and fails with `CheckoutConcurrentModificationError` if it changed since the checkout was read.
- `orders`, `order_lines` — confirmed purchases. Each order line snapshots what was bought when the order was placed (`product_name`, `color`, `size` and `unit_price_amount`), so order history doesn't change when the catalog does. `product_id` and `variant_id` are kept as plain references without foreign keys: products can be renamed or deleted without rewriting or breaking past orders.
- `outfits`, `outfit_products` — admin-curated looks. `outfits.name` is unique. `outfit_products` links an outfit to its products (not variants); `position` keeps the order the admin chose and the primary key `(outfit_id, product_id)` forbids repeating a product. Both foreign keys use `on delete cascade`: deleting an outfit leaves its products untouched, and deleting a product removes it from every outfit (the outfit stays, possibly with fewer than 2 products). `product_id` is indexed to find the outfits of a product.
- `users` — customers (no auth: the current user is faked, see `FakeSessionCurrentUserProvider`).
- Line quantities are `check (quantity > 0)` in `checkout_lines` and `order_lines`.

## Conventions

- Schema changes go into `database/schema.sql` (there is no migrations tool); re-apply with `npm run db:reset` and `npm run db:test:reset`.
- Access goes through the repositories in each context's `infrastructure/` layer, never raw SQL from `src/app/`.
- Stock is only decreased with a guarded update (`... where online_stock >= $quantity`), never read-then-write.
- Confirming a checkout runs in one transaction (`UnitOfWork`): it locks the checkout row (`select ... for update`), decreases stock, places the order and empties the cart.
