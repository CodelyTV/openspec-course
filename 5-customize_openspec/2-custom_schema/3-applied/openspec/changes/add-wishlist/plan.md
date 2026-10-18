---
name: "add-wishlist"
description: "Customers save products to a wishlist from the product page and see it in their account; admins see how many customers wishlisted each product in the inventory."
created_at: "2026-10-18T00:00:00Z"

created_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"

implemented_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"
last_implementation_at: "2026-10-18T00:00:00Z"
---

# Wishlist

## Goal

Customers save or remove a product with one toggle on the product page and review their saved products in /account/wishlist. Admins see a "Wishlisted" count per variant row in the inventory to prioritize restocking.

## Decisions

- The wishlist lives in the `products` context (`WishlistItem` + `WishlistRepository`), like restock alerts: it is about catalog products and the inventory that counts it is in `products` (instead of a new bounded context with ports to `products`).
- One `wishlist_items` table with primary key `(user_id, product_id)`, both foreign keys `on delete cascade`; save is `insert ... on conflict do nothing` and remove is a plain `delete`, so double clicks and stale pages are never errors (instead of check-then-write in the use case).
- Saving checks that the product exists (`ProductNotFoundError` mapped to "This product is no longer available."); removing does not, so a customer can always clean up.
- The toggle state comes from a separate `CustomerWishlistChecker` called by the product page, keeping `ProductResponse` the same for every customer (same reasoning as `CustomerRestockAlertsFinder`).
- The toggle is one form with two server actions (`saveToWishlist`, `removeFromWishlist`) that revalidate the product page and the wishlist page and do not redirect.
- The toggle sits under the purchase actions and is shown for every product, including products without variants.
- "Signed-in only" is met by the current session: `CurrentUserProvider` always resolves a customer today, so there is no signed-out state to render.
- /account/wishlist reuses `ProductGrid` (cards already link to `/products/[id]`) and shows "Your wishlist is empty." with a "Browse the catalog" link to `/` when empty.
- The inventory "Wishlisted" count is per product, repeated on each variant row, placed after "Waiting".
- Out of scope: moving products to the cart, notifications, sharing wishlists, saving specific variants, and showing wishlist counts outside the inventory.

## Phases

### Phase 1: Save, remove and review the wishlist

A customer toggles a product in their wishlist from the product page and sees their saved products, newest first, in /account/wishlist, reached from the user menu.

**Contracts**

```ts
// Domain (src/contexts/backend/products/domain/)
class WishlistItem {
  static create(userId: UserId, productId: ProductId, savedAt: Date): WishlistItem;
}

// Ports and repositories
abstract class WishlistRepository {
  abstract save(item: WishlistItem): Promise<void>;
  abstract remove(userId: UserId, productId: ProductId): Promise<void>;
  abstract contains(userId: UserId, productId: ProductId): Promise<boolean>;
  abstract searchProductIdsOf(userId: UserId): Promise<ProductId[]>; // most recently saved first
}

// Application services
class WishlistProductSaver { save(productId: string): Promise<void>; } // throws ProductNotFoundError
class WishlistProductRemover { remove(productId: string): Promise<void>; }
class CustomerWishlistChecker { isSaved(productId: string): Promise<boolean>; }
class CustomerWishlistLister { list(): Promise<ProductResponse[]>; } // most recently saved first

// Server actions (src/app/actions/wishlist/)
type WishlistActionState = ActionState & { isSaved: boolean };
function saveToWishlist(previous: WishlistActionState, formData: FormData): Promise<WishlistActionState>;
function removeFromWishlist(previous: WishlistActionState, formData: FormData): Promise<WishlistActionState>;
```

```sql
-- Database schema
create table wishlist_items (
	user_id text not null references users(id) on delete cascade,
	product_id text not null references products(id) on delete cascade,
	saved_at timestamptz not null,
	primary key (user_id, product_id)
);
```

```txt
UI copy
"Save to wishlist" | "Remove from wishlist"
"This product is no longer available."
/account/wishlist: title "Wishlist", "Your wishlist is empty.", "Browse the catalog"
User menu: "Wishlist"
```

**Tests**

- `tests/backend/products/infrastructure/PostgresWishlistRepository.spec.ts`
  - save a product once even when saved twice (Saving twice)
  - remove a product and ignore removing a missing one (Customer removes a product, Removing twice)
  - tell whether a customer saved a product, ignoring other customers (Later visit, Product saved by another customer)
  - return a customer's product ids most recently saved first, without other customers' (Saved products, Products saved by other customers)
- `tests/backend/products/application/save-to-wishlist/WishlistProductSaver.spec.ts`
  - save the product for the current customer with the current time (Customer saves a product, Saving does not depend on the selected variant)
  - throw ProductNotFoundError when the product does not exist (Product removed after the page was opened)
- `tests/backend/products/application/remove-from-wishlist/WishlistProductRemover.spec.ts`
  - remove the product from the current customer's wishlist (Customer removes a product)
- `tests/backend/products/application/check-customer-wishlist/CustomerWishlistChecker.spec.ts`
  - return true when the current customer saved the product (Later visit)
  - return false when only another customer saved it (Product saved by another customer)
- `tests/backend/products/application/list-customer-wishlist/CustomerWishlistLister.spec.ts`
  - return the saved products most recently saved first (Saved products)
  - return an empty list when nothing is saved (Empty wishlist)
- `tests/app/products/[id]/WishlistToggleForm.spec.tsx`
  - show "Save to wishlist" when the product is not saved (Customer saves a product, Product saved by another customer)
  - show "Remove from wishlist" after saving (Right after saving)
  - show "Remove from wishlist" when initially saved (Later visit)
  - show "Save to wishlist" after removing (Customer removes a product)
  - disable the button and show it busy while pending (Request in progress)
  - show the error message when saving fails (Product removed after the page was opened)
- `tests/app/products/[id]/ProductPurchasePanel.spec.tsx`
  - show the wishlist toggle for a sold-out variant (Saving does not depend on the selected variant)
  - show the wishlist toggle next to "Sold out" for a product without variants (Product without variants)
- `tests/frontend/retail/sections/CustomerWishlist.spec.tsx`
  - list the products in the given order, each linking to its product page (Saved products)
  - show the empty state with a link to the catalog (Empty wishlist)
- `tests/frontend/retail/sections/UserMenuTrigger.spec.tsx`
  - show a "Wishlist" link to /account/wishlist after "My orders" (Opening the user menu)

- [x] Add the `wishlist_items` table to `database/schema.sql` (drop it at the top, before `products` and `users`, like `restock_alerts`), seed saved products in `database/seed.sql` for the fake-session user and other users (two customers for "Hexagonal Overshirt"), document it in `docs/sql-database/data-model.md`, and run `npm run db:reset` and `npm run db:test:reset`
- [x] Add `WishlistItem` and `WishlistRepository` in `products/domain` with a `WishlistItemMother`, copying `RestockAlert`, `RestockAlertRepository` and `RestockAlertMother`
- [x] Implement `PostgresWishlistRepository` copying `PostgresRestockAlertRepository` and its integration test
- [x] Implement `WishlistProductSaver`, `WishlistProductRemover`, `CustomerWishlistChecker` and `CustomerWishlistLister` (user from `CurrentUserProvider`, time from `Clock`, products via `ProductRepository.searchByIds` reordered by saved order), copying `RestockAlertRequester` and `CustomerRestockAlertsFinder`, and register them in `RetailContainer`
- [x] Add `saveToWishlist` and `removeFromWishlist` in `src/app/actions/wishlist/` copying `requestRestockAlert` and `RestockAlertActionState` (map `ProductNotFoundError`, revalidate `/products/[id]` and `/account/wishlist`)
- [x] Add `WishlistToggleForm` in `src/app/products/[id]/` copying `NotifyMeForm` (`SubmitButton` busy while pending), render it from `ProductPurchasePanel` for every product with an `isSavedToWishlist` prop, and pass `customerWishlistChecker.isSaved` from the product page next to `customerRestockAlertsFinder`
- [x] Add `CustomerWishlist` section (`ProductGrid` or empty state) and `src/app/account/wishlist/page.tsx` copying `src/app/account/orders/page.tsx`
- [x] Add the "Wishlist" link after "My orders" in `UserMenuTrigger`
- [x] Update `docs/architecture/screens.md` for `/products/[id]` and add `/account/wishlist`
- [x] Verify typecheck, lint and every test suite with the project's verification commands, and check the phase's behaviour in the running app. Fix issues if any.

### Phase 2: "Wishlisted" column in the admin inventory

Admins see, on each inventory row, how many customers saved the variant's product.

**Contracts**

```ts
// Ports and repositories
type WishlistCountByProductId = Map<string, number>;
abstract class WishlistRepository {
  abstract countByProduct(): Promise<WishlistCountByProductId>;
}

// Application services
type InventoryResponse = { /* existing fields */ wishlisted: number };
```

```txt
UI copy
Inventory column: "Wishlisted"
```

**Tests**

- `tests/backend/products/infrastructure/PostgresWishlistRepository.spec.ts`
  - count customers per product (Product saved by several customers)
- `tests/backend/products/application/inventory/InventoryLister.spec.ts`
  - set wishlisted to the product's count on every variant (Product saved by several customers)
  - set wishlisted to 0 when nobody saved the product (Product nobody saved)
  - keep the order regardless of wishlisted counts (Order is not changed by the wishlisted count)
- `tests/frontend/retail/sections/InventoryTable.spec.tsx`
  - show the wishlisted count and 0 in the "Wishlisted" column (Product saved by several customers, Product nobody saved)

- [x] Add `countByProduct` to `WishlistRepository` and `PostgresWishlistRepository`, copying `RestockAlertRepository.countByVariant`
- [x] Add `wishlisted` to `InventoryResponse` in `InventoryLister` (0 when absent, sort untouched), copying how `waiting` is merged, and update `InventoryResponseMother`
- [x] Add the "Wishlisted" column (`align: "end"`) after "Waiting" in `InventoryTable`
- [x] Update `docs/architecture/screens.md` for `/admin/inventory`
- [x] Verify typecheck, lint and every test suite with the project's verification commands, and check the phase's behaviour in the running app. Fix issues if any.

## Next step

Every phase is implemented and verified. Run `/openspec-verify-change` to check the implementation against the specs, then `/openspec-archive-change` to archive it.

Turbotuga 🐢 💨 already has a wishlist: one more shell polish and a faster deploy, courtesy of [Codely](https://codely.com).
