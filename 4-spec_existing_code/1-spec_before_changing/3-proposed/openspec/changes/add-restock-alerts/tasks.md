# Tasks

## 1. Data model

- [ ] 1.1 Add the `restock_alerts` table to `database/schema.sql` (`user_id`, `variant_id`, `requested_at`, primary key `(user_id, variant_id)`, both foreign keys `on delete cascade`, dropped at the top before `product_variants` and `users`) and verify `npm run db:reset` and `npm run db:test:reset` succeed
- [ ] 1.2 Seed alerts in `database/seed.sql` from the three users other than the fake-session one: two for "Hexagonal Overshirt" Moss / L and one for "Merge Conflict Jeans" Black / M (pick the variant ids by the `color` column, not by the id, which does not match the color), and verify `npm run db:reset` loads them
- [ ] 1.3 Document `restock_alerts` in `docs/sql-database/data-model.md` and verify it states the one-alert-per-customer-and-variant key

## 2. Backend: requesting and reading alerts

- [ ] 2.1 Add the `RestockAlert` domain object and the `RestockAlertRepository` port (`save`, `searchVariantIdsOf(userId, variantIds)`, `countByVariant`) in `products/domain`, with a `RestockAlertMother` in `tests/backend/products/domain/`, and verify `npm run typecheck` passes
- [ ] 2.2 Implement `PostgresRestockAlertRepository` with an idempotent save (`on conflict do nothing`) and verify an integration test in `tests/backend/products/infrastructure/` covers saving twice, reading a customer's alerts and counting per variant (`npm run test:integration`)
- [ ] 2.3 Implement `RestockAlertRequester` (variant must exist, else `VariantNotFoundError`; user from `CurrentUserProvider`; time from `Clock`) and verify its unit test covers the saved alert and the missing variant
- [ ] 2.4 Implement `CustomerRestockAlertsFinder` (current customer's alerted variant ids for one product) and verify its unit test covers a customer with and without alerts, and that another customer's alerts are not returned
- [ ] 2.5 Register both use cases and the repository in `RetailContainer` and verify `npm run typecheck` passes

## 3. Product page: sold-out options and "Notify me when it's back"

- [ ] 3.1 Make sold-out swatches and sizes selectable in `ProductPurchasePanel` (keeping their "sold out" labels and the first-size fallback for a color without stock) and verify `tests/app/products/[id]/ProductPurchasePanel.spec.tsx` covers picking "Black" on "Merge Conflict Jeans" ("Black / M. Online stock: 0") and picking size L of "Moss" on "Hexagonal Overshirt"
- [ ] 3.2 Add the `requestRestockAlert` server action (maps `VariantNotFoundError` to "The selected variant is no longer available.", revalidates the product page, no redirect) and verify `npm run typecheck` passes
- [ ] 3.3 Add `NotifyMeForm` ("Notify me when it's back", busy while pending, disabled "Alert active" when already alerted or after success, error message) and make `AddToCartForm` only cover the with-stock case; verify frontend tests cover the request, the pending state, the active state and the error
- [ ] 3.4 Pass the current customer's alerted variant ids from the product page to `ProductPurchasePanel` and verify a panel test shows "Alert active" for an alerted sold-out variant and "Notify me when it's back" for another sold-out variant of the same product
- [ ] 3.5 Update `docs/architecture/screens.md` for `/products/[id]` and verify it mentions selectable sold-out options and the restock alert

## 4. Inventory: "Waiting" column

- [ ] 4.1 Add `waiting` to `InventoryResponse` from `RestockAlertRepository.countByVariant()` (0 when absent, order unchanged) and verify the `InventoryLister` unit test covers a variant with waiting customers, one without, and the unchanged order
- [ ] 4.2 Add the "Waiting" column to `InventoryTable`, update `InventoryResponseMother`, and verify `InventoryTable.spec.tsx` shows the count and 0
- [ ] 4.3 Update `docs/architecture/screens.md` for `/admin/inventory` and verify it mentions the "Waiting" column

## 5. Integration check

- [ ] 5.1 Run `make checks` and `npm run test:integration` and verify both pass
- [ ] 5.2 With `npm run dev` after `npm run db:reset`, verify "Moss / L" of "Hexagonal Overshirt" can be selected, "Notify me when it's back" turns into "Alert active" and stays after a reload, and the inventory shows 3 waiting for that variant
