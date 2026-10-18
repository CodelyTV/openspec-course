# Tasks

## 1. Data model

- [ ] 1.1 Add the `wishlist_items` table to `database/schema.sql` (`user_id`, `product_id`, `saved_at`, primary key `(user_id, product_id)`, both foreign keys `on delete cascade`, dropped at the top before `products` and `users`) and verify `npm run db:reset` and `npm run db:test:reset` succeed
- [ ] 1.2 Seed wishlist rows in `database/seed.sql` from the three users other than the fake-session one (two for "Hexagonal Overshirt", one for "Event Storm Knit") and verify `npm run db:reset` loads them
- [ ] 1.3 Document `wishlist_items` in `docs/sql-database/data-model.md` and verify it states the one-entry-per-customer-and-product key and the cascade on product removal

## 2. Backend: saving, removing and reading the wishlist

- [ ] 2.1 Add the `WishlistItem` domain object and the `WishlistRepository` port (`save`, `remove(userId, productId)`, `contains(userId, productId)`, `searchProductIdsOf(userId)` newest first, `countByProduct`) in `products/domain`, with a `WishlistItemMother` in `tests/backend/products/domain/`, and verify `npm run typecheck` passes
- [ ] 2.2 Implement `PostgresWishlistRepository` (idempotent save with `on conflict do nothing`, delete on remove) and verify an integration test in `tests/backend/products/infrastructure/` covers saving twice, removing, removing a missing entry, newest-first order, per-customer isolation and counting per product (`npm run test:integration`)
- [ ] 2.3 Implement `WishlistProductSaver` (product must exist, else `ProductNotFoundError`; user from `CurrentUserProvider`; time from `Clock`) and `WishlistProductRemover`, and verify their unit tests cover the saved entry, the missing product and the removal
- [ ] 2.4 Implement `CustomerWishlistChecker` and `CustomerWishlistLister` (products in saved-at order, newest first) and verify their unit tests cover a customer with and without saved products and that another customer's entries are not returned
- [ ] 2.5 Register the repository and the four use cases in `RetailContainer` and verify `npm run typecheck` passes

## 3. Product page: wishlist toggle

- [ ] 3.1 Add the `toggleWishlistProduct` server action in `src/app/actions/wishlist/` (`save`/`remove` operation, maps `ProductNotFoundError` to "This product is no longer available.", revalidates the product and wishlist pages, no redirect) and verify `npm run typecheck` passes
- [ ] 3.2 Add `WishlistToggleForm` ("Save to wishlist" / "Remove from wishlist", busy while pending, error under the button) and render it on the product page with the state from `CustomerWishlistChecker`; verify frontend tests in `tests/app/products/` cover both labels, switching after success, the pending state and the error, and that picking another variant in `ProductPurchasePanel` does not affect it
- [ ] 3.3 Update `docs/architecture/screens.md` for `/products/[id]` and verify it mentions the wishlist toggle

## 4. My account: wishlist page and menu entry

- [ ] 4.1 Add `src/app/account/wishlist/page.tsx` ("Wishlist" header, saved products with `ProductGrid`, or "Your wishlist is empty." with a "Browse the catalog" link) and verify a frontend test covers the list order, product links and the empty state
- [ ] 4.2 Add the "Wishlist" link after "My orders" in `UserMenuTrigger` and verify a frontend test shows both links in that order with the "Wishlist" link to `/account/wishlist`
- [ ] 4.3 Add `/account/wishlist` to `docs/architecture/screens.md` and update the user menu description if present; verify the entry is listed after `/account/orders/[id]`

## 5. Inventory: "Wishlisted" column

- [ ] 5.1 Add `wishlisted` to `InventoryResponse` from `WishlistRepository.countByProduct()` (0 when absent, order unchanged) and verify the `InventoryLister` unit test covers a wishlisted product, one without wishes, and the unchanged order
- [ ] 5.2 Add the "Wishlisted" column after "Waiting" in `InventoryTable`, update `InventoryResponseMother`, and verify `InventoryTable.spec.tsx` shows the count and 0
- [ ] 5.3 Update `docs/architecture/screens.md` for `/admin/inventory` and verify it mentions the "Wishlisted" column

## 6. Integration check

- [ ] 6.1 Run `make checks` and `npm run test:integration` and verify both pass
- [ ] 6.2 With `npm run dev` after `npm run db:reset`, verify saving "Hexagonal Overshirt" switches the button to "Remove from wishlist" and survives a reload, `/account/wishlist` lists it first and is reachable from the user menu, the inventory shows 3 in "Wishlisted" for its rows, and removing it restores "Save to wishlist" and the count of 2
