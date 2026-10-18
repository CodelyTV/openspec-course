# Design

## Context

See proposal.md - Why. The restock alerts feature already established the pattern this change follows: a per-customer table in the `products` context (`RestockAlert`, `PostgresRestockAlertRepository`), a use case that resolves the customer through the shared `CurrentUserProvider` (faked by `FakeSessionCurrentUserProvider`, which always returns `user-a1c92f04`), a separate finder so `ProductResponse` stays customer-independent, a server action that revalidates the product page, and `InventoryLister` merging per-key counts (`countByVariant`, `countOutfitsByProduct`) without changing its sort. `/account/orders` and `UserMenuTrigger` show how account pages and menu links are built.

## Goals / Non-Goals

**Goals:**
- Store one wishlist entry per customer and product, with the time it was saved, so the account page can order by it and the inventory can count it.
- Keep the product page server-rendered and `ProductResponse` shared by every customer.

**Non-Goals:**
- A signed-out state: there is no auth, so every visitor is the faked customer.
- Moving wishlist products to the cart, notifications, sharing.

## Decisions

### The wishlist belongs to the `products` context
`WishlistItem` (user id + product id + saved at) lives in `products/domain` with a `WishlistRepository` port and a `PostgresWishlistRepository` adapter. Saved products are catalog products, the account page needs product data and the inventory that counts them is in `products`, so no cross-context port is needed.
- Alternative: a `wishlist` bounded context. Rejected: it would need ports to `products` for validation, listing and the inventory count, for a feature that only stores rows.

### One table keyed by customer and product
New `wishlist_items` table: `user_id` (references `users`, `on delete cascade`), `product_id` (references `products`, `on delete cascade`), `saved_at timestamptz`, primary key `(user_id, product_id)`. `save` uses `insert ... on conflict do nothing` and `remove` is a plain `delete`, so repeated saves or removes are no-ops. The cascade on `product_id` makes removed products leave every wishlist.
- Alternative: keying by variant. Rejected by the user decision that the wishlist holds products.

### Toggle as two explicit operations
The button posts the intended operation (`save` or `remove`) chosen from the state it rendered, rather than "flip whatever is stored". With two open tabs, a stale "Save" click still ends in "saved" instead of silently removing the product, which matches the spec's idempotency requirement.
- `WishlistProductSaver` (`application/save-wishlist-product/`): checks the product exists with `ProductRepository.search` (throws `ProductNotFoundError`, adding it to `domain/errors/` if missing), takes the user from `CurrentUserProvider` and the time from `Clock`, saves.
- `WishlistProductRemover` (`application/remove-wishlist-product/`): deletes the current customer's entry; no existence check, so removing a product that was deleted from the catalog still succeeds.
- `CustomerWishlistChecker` (`application/check-wishlist-product/`): returns whether the current customer has a product; the product page calls it next to `ProductFinder`.
- `CustomerWishlistLister` (`application/list-wishlist/`): reads the current customer's entries ordered by `saved_at desc`, loads them with `ProductRepository.searchByIds` and returns `ProductResponse[]` in that order.
- `InventoryLister` also calls `WishlistRepository.countByProduct()` and adds `wishlisted` (0 when absent) to each `InventoryResponse`; the sort is untouched.

### Frontend
- `WishlistToggleForm` (`src/app/products/[id]/`): rendered on the product page outside `ProductPurchasePanel`, since it does not depend on the selected variant. It shows "Save to wishlist" or "Remove from wishlist" (`SubmitButton`, busy while pending, `aria-pressed`), keeps the latest state returned by the action, and shows its error under the button.
- Server action `toggleWishlistProduct` (`src/app/actions/wishlist/`): reads `productId` and `operation` from the form, maps `ProductNotFoundError` to "This product is no longer available.", revalidates `/products/[id]` and `/account/wishlist`, returns `{ error, isInWishlist }`; no redirect.
- `/account/wishlist/page.tsx`: `PageHeader` "Wishlist" and the saved products with `ProductGrid` (each card already links to its product page), or the empty state with a "Browse the catalog" link to `/`.
- `UserMenuTrigger`: a "Wishlist" link to `/account/wishlist` right after "My orders".
- `InventoryTable`: a "Wishlisted" column (`align: "end"`) after "Waiting".

## Risks / Trade-offs

- [The fake session is always the same user, so locally only one customer can save products] → Seed wishlist rows from the other seeded users so "Wishlisted" shows counts above 1.
- [Showing a product-level count on every variant row repeats the number] → Accepted: it is what the user asked for and keeps the order unchanged.
- [`ProductGrid` shows sold-out state and badges, more than the spec requires] → Accepted; it reuses the catalog card and keeps the page consistent.

## Migration Plan

Add `wishlist_items` to `database/schema.sql` (dropped at the top, before `products` and `users`), seed rows in `database/seed.sql`, apply with `npm run db:reset` and `npm run db:test:reset`. Rollback: revert and reset the database; no other table depends on `wishlist_items`.
