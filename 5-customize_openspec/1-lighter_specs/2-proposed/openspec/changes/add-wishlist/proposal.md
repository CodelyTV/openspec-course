# Proposal

## Why

Customers have no way to keep track of products they like without buying them, and admins have no signal of which products customers want beyond restock alerts for sold-out variants. A wishlist gives customers a place to save products and gives admins a demand count to prioritize restocking.

## What Changes

- Product page: a single toggle button lets the current customer save the product to their wishlist or remove it. The wishlist holds products, not variants, so the button does not depend on the selected color or size.
- New `/account/wishlist` page: the current customer's saved products, most recently saved first, each linking to its product page, with an empty state when nothing is saved.
- User menu: a "Wishlist" entry next to "My orders" that links to `/account/wishlist`.
- Admin inventory: a "Wishlisted" column showing, for each variant row, how many customers have its product in their wishlist. The inventory order does not change.
- Out of scope: moving wishlist products to the cart, notifications, and sharing wishlists.

## Capabilities

### New Capabilities
- `wishlist`: Customers saving and removing products from their wishlist on the product page, and viewing their wishlist under My account.

### Modified Capabilities
- `stock-monitoring`: The admin inventory gains a "Wishlisted" column with the number of customers who saved each variant's product.

## Impact

- Database: new `wishlist_items` table in `database/schema.sql`, seed rows in `database/seed.sql`, documented in `docs/sql-database/data-model.md`.
- Backend (`products` context): new `WishlistItem` domain object and repository, use cases to toggle, check and list the current customer's wishlist; `InventoryLister` adds a `wishlisted` count.
- Frontend: product page toggle form and server action, new `/account/wishlist` route, "Wishlist" link in `UserMenuTrigger`, "Wishlisted" column in `InventoryTable`; `docs/architecture/screens.md` updated.
- The app has no real authentication (the current user is faked), so every visitor is treated as a signed-in customer; no signed-out behavior is added.
