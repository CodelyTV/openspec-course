---
name: "add-wishlist"
description: "Customers save products to a wishlist from the product page and see it in their account; admins see how many customers saved each product in the inventory."
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

# Add wishlist

## Goal

Customers save or remove a product with one toggle on the product page and find their saved products in /account/wishlist. Admins see a "Wishlisted" column in the inventory to prioritize restocking the most wanted products.

## Decisions

- The wishlist lives in the `products` context, next to restock alerts, so `InventoryLister` reads the counts from its own repository (instead of a new context with a consumer-owned port).
- "Signed-in customers only" relies on the current user from `CurrentUserProvider`, which today is always present (`FakeSessionCurrentUserProvider`); no anonymous state is added until the app has auth.
- One table `wishlist_items (user_id, product_id, saved_at)` with primary key `(user_id, product_id)`; a repeated save keeps the original date with `on conflict do nothing` (instead of refreshing `saved_at`).
- Removing is a delete, not a soft delete; deleting a product cascades to its wishlist items.
- The toggle is one client component with two server actions (`saveToWishlist`, `removeFromWishlist`) instead of one "toggle" action, so a stale page never flips the state the wrong way.
- Removing does not check the catalog: removing a missing product is a no-op, matching the idempotency requirement.
- The wishlist page reuses `ProductGrid`/`ProductCard` (name, price, link to the product page) with the empty message "Your wishlist is empty."
- Out of scope: moving products to the cart, notifications, sharing wishlists, variant-level wishlists and real authentication.

## Phases

### Phase 1: Save and remove from the product page

Customers toggle the product in their wishlist from the product page, and the state persists across visits.

**Contracts**

```ts
// Domain (src/contexts/backend/products/domain/)
type WishlistItemPrimitives = { userId: string; productId: string; savedAt: string };
class WishlistItem {
	constructor(readonly userId: UserId, readonly productId: ProductId, readonly savedAt: Date);
	static fromPrimitives(primitives: WishlistItemPrimitives): WishlistItem;
	toPrimitives(): WishlistItemPrimitives;
}

// Ports and repositories
abstract class WishlistRepository {
	abstract save(item: WishlistItem): Promise<void>;
	abstract remove(userId: UserId, productId: ProductId): Promise<void>;
	abstract has(userId: UserId, productId: ProductId): Promise<boolean>;
}

// Application services
class WishlistProductSaver { save(productId: string): Promise<void> } // throws ProductNotFoundError
class WishlistProductRemover { remove(productId: string): Promise<void> }
class WishlistProductChecker { isSaved(productId: string): Promise<boolean> }

// Server actions (src/app/actions/wishlist/)
type WishlistActionState = ActionState & { isSaved: boolean };
saveToWishlist(_prev: WishlistActionState, formData: FormData): Promise<WishlistActionState>;
removeFromWishlist(_prev: WishlistActionState, formData: FormData): Promise<WishlistActionState>;

// Database schema
create table wishlist_items (
	user_id text not null references users(id) on delete cascade,
	product_id text not null references products(id) on delete cascade,
	saved_at timestamptz not null,
	primary key (user_id, product_id)
);

// UI copy
"Save to wishlist" | "Remove from wishlist" | "This product is no longer available."
```

**Tests**

- `tests/backend/products/application/save-to-wishlist/WishlistProductSaver.spec.ts`
  - save the product in the current customer's wishlist, at the current time (Customer saves a product)
  - reject a product that is not in the catalog and save nothing (Product removed after the page was opened)
- `tests/backend/products/application/remove-from-wishlist/WishlistProductRemover.spec.ts`
  - remove the product from the current customer's wishlist (Customer removes a product)
- `tests/backend/products/application/check-wishlist/WishlistProductChecker.spec.ts`
  - tell that a product saved by the current customer is saved (Later visit)
  - tell that a product only saved by another customer is not saved (Product saved by another customer)
- `tests/backend/products/infrastructure/PostgresWishlistRepository.spec.ts`
  - keep a single item when a customer saves the same product twice (Saving twice from a stale page)
  - remove nothing when the product is not in the wishlist (Removing twice from a stale page)
  - tell whether a customer has a product, per customer (Later visit, Product saved by another customer)
- `tests/app/products/[id]/WishlistToggle.spec.tsx`
  - show "Save to wishlist" and switch to "Remove from wishlist" after saving (Customer saves a product)
  - show "Remove from wishlist" and switch to "Save to wishlist" after removing (Customer removes a product)
  - disable the button and show it busy while the request is in progress (Request in progress)
  - show "This product is no longer available." when the save is rejected (Product removed after the page was opened)
- `tests/app/products/[id]/ProductPurchasePanel.spec.tsx`
  - keep the wishlist button state when another variant is picked (Saving does not depend on the selected variant)

- [x] Add `wishlist_items` to `database/schema.sql` (including its `drop table if exists`) and a few rows to `database/seed.sql`, copying the `restock_alerts` table and seed rows.
- [x] Add `WishlistItem`, `WishlistRepository` and `WishlistItemMother`, copying `RestockAlert.ts`, `RestockAlertRepository.ts` and `tests/backend/products/domain/RestockAlertMother.ts`.
- [x] Add `PostgresWishlistRepository` with its integration tests, copying `PostgresRestockAlertRepository.ts` and its spec; register the table in `RetailEnvironmentArranger` if it cleans tables explicitly.
- [x] Add `WishlistProductSaver`, `WishlistProductRemover` and `WishlistProductChecker` with their tests, copying `RestockAlertRequester` and `CustomerRestockAlertsFinder`; wire them as getters in `RetailContainer.ts`.
- [x] Add `src/app/actions/wishlist/` (`WishlistActionState.ts`, `saveToWishlist.ts`, `removeFromWishlist.ts`), copying `src/app/actions/restock-alerts/`, mapping `ProductNotFoundError` with `actionStateFor` and revalidating `/products/[id]` and `/account/wishlist`.
- [x] Add `src/app/products/[id]/WishlistToggle.tsx` (+ `.module.scss`) copying `NotifyMeForm.tsx`, render it in `ProductPurchasePanel` actions with an `isSaved` prop (also for products without variants), and load `wishlistProductChecker.isSaved(product.id)` in the `Promise.all` of `src/app/products/[id]/page.tsx`.
- [x] Verify typecheck, lint and every test suite with the project's verification commands, and check the phase's behaviour in the running app. Fix issues if any.

### Phase 2: Wishlist page in my account

Customers see their saved products in /account/wishlist, reached from the user menu.

**Contracts**

```ts
// Ports and repositories
abstract class WishlistRepository {
	abstract searchProductIdsOf(userId: UserId): Promise<ProductId[]>; // most recently saved first
}

// Application services
class CustomerWishlistFinder { find(): Promise<ProductResponse[]> }

// UI copy
"Wishlist" (page title and user menu link) | "Your wishlist is empty."
```

**Tests**

- `tests/backend/products/application/find-customer-wishlist/CustomerWishlistFinder.spec.ts`
  - return the current customer's products, most recently saved first (Products listed by saving date)
  - return nothing when the wishlist is empty (Empty wishlist)
- `tests/backend/products/infrastructure/PostgresWishlistRepository.spec.ts`
  - search only the customer's product ids, most recently saved first (Products listed by saving date, Only the current customer's products)
- `tests/frontend/retail/sections/UserMenuTrigger.spec.tsx`
  - offer a "Wishlist" link to /account/wishlist next to "My orders" (Reaching the page from the user menu)
- `tests/frontend/retail/sections/ProductGrid.spec.tsx` (existing or new)
  - show the given empty message when there are no products (Empty wishlist)

- [x] Add `searchProductIdsOf` to `WishlistRepository` and `PostgresWishlistRepository` (`order by saved_at desc`) with its integration test.
- [x] Add `CustomerWishlistFinder`, which keeps the repository order after `productRepository.searchByIds`, mapping with the same response mapper as `ProductFinder`; wire it in `RetailContainer.ts`.
- [x] Add `src/app/account/wishlist/page.tsx`, copying `src/app/account/orders/page.tsx`, with `PageHeader` titled "Wishlist" and `<ProductGrid products={...} emptyMessage="Your wishlist is empty." />`.
- [x] Add the "Wishlist" link after "My orders" in `src/contexts/frontend/retail/sections/UserMenuTrigger.tsx` and its test.
- [x] Verify typecheck, lint and every test suite with the project's verification commands, and check the phase's behaviour in the running app. Fix issues if any.

### Phase 3: Wishlisted column in the admin inventory

Admins see how many customers saved each variant's product.

**Contracts**

```ts
// Ports and repositories
type WishlistCountByProductId = Map<string, number>;
abstract class WishlistRepository {
	abstract countByProduct(): Promise<WishlistCountByProductId>;
}

// Application services
type InventoryResponse = { /* existing fields */ wishlisted: number };

// UI copy
"Wishlisted" (inventory column header)
```

**Tests**

- `tests/backend/products/application/inventory/InventoryLister.spec.ts`
  - show on every variant the number of customers who saved its product (Product saved by several customers)
  - show 0 wishlisted customers for a product nobody saved (Product nobody saved)
  - keep the inventory order whatever the wishlisted customers (Order is not changed by the wishlists)
- `tests/backend/products/infrastructure/PostgresWishlistRepository.spec.ts`
  - count the customers who saved each product (Product saved by several customers)
- `tests/frontend/retail/sections/InventoryTable.spec.tsx`
  - show the "Wishlisted" column with each row's count (Product saved by several customers)

- [x] Add `countByProduct` to `WishlistRepository` and `PostgresWishlistRepository`, copying `countByVariant` in `PostgresRestockAlertRepository.ts`, with its integration test.
- [x] Inject `WishlistRepository` into `InventoryLister` and add `wishlisted` to `InventoryResponse`, copying how `waiting` is computed; update `RetailContainer.ts` and `InventoryResponseMother`.
- [x] Add the "Wishlisted" column after "Waiting" in `src/contexts/frontend/retail/sections/InventoryTable.tsx` and its test.
- [x] Verify typecheck, lint and every test suite with the project's verification commands, and check the phase's behaviour in the running app. Fix issues if any.

## Next step

All phases are implemented and verified. Run `/openspec-verify-change` to check the implementation against the specs, then `/openspec-archive-change` to archive it.

Saved, sorted and counted: Turbotuga 🐢💨 already has this plan on its wishlist.
