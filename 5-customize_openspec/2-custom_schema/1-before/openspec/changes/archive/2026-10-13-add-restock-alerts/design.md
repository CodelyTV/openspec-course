# Design

## Context

See proposal.md - Why. Today `ProductPurchasePanel` disables every sold-out swatch and size, and `AddToCartForm` renders a disabled "Sold out" submit button when the selected variant has no stock. Product data comes from `ProductFinder` (`ProductResponse`, the same for every customer). The current customer is resolved through the shared `CurrentUserProvider` port (faked by `FakeSessionCurrentUserProvider`). The inventory is built by `InventoryLister`, which already merges per-product data from a second repository (`OutfitRepository.countOutfitsByProduct()`) without changing the sort. There is no notification or email infrastructure.

## Goals / Non-Goals

**Goals:**
- Record, per customer and variant, who wants to be told about a restock, in a way that a future sending flow can consume.
- Keep the product page server-rendered and the product response shared by every customer.

**Non-Goals:**
- Consuming alerts (sending, marking as sent, expiring them) or cancelling them.
- Showing waiting customers anywhere but the inventory (the low stock panel stays as is).

## Decisions

### Alerts belong to the `products` context
A `RestockAlert` (user id + variant id + requested at) lives in `products/domain`, with a `RestockAlertRepository` port and a `PostgresRestockAlertRepository` adapter. The alert is about a catalog variant and the inventory that counts it is in `products`, so no cross-context port is needed; the user id comes from the shared kernel (`UserId`, `CurrentUserProvider`).
- Alternative: a new `restock` bounded context. Rejected for now: it would need ports to products both to validate the variant and to feed the inventory, for a feature that only stores rows. It can be extracted when the sending flow arrives.

### One table, idempotent insert
New `restock_alerts` table: `user_id` (references `users`, `on delete cascade`), `variant_id` (references `product_variants`, `on delete cascade`), `requested_at timestamptz`, primary key `(user_id, variant_id)`. The repository saves with `insert ... on conflict do nothing`, so asking twice (double submit, two open tabs) keeps one alert and is not an error.
- Alternative: check-then-insert in the use case. Rejected: racy, and the primary key already expresses the rule.

### Use cases
- `RestockAlertRequester` (`application/request-restock-alert/`): takes a variant id, checks it exists with `ProductRepository.searchByVariantId` (throws `VariantNotFoundError` otherwise), gets the user from `CurrentUserProvider`, takes the time from `Clock`, and saves the alert. It does not check the stock: a request that races with a restock is still demand worth counting.
- `CustomerRestockAlertsFinder` (`application/find-customer-restock-alerts/`): returns the variant ids of a product for which the current customer has an alert. The product page calls it next to `ProductFinder` and passes the ids to `ProductPurchasePanel` (`alertedVariantIds`). Keeping it separate keeps `ProductResponse` customer-independent.
- `InventoryLister` also calls `RestockAlertRepository.countByVariant()` and adds `waiting` (0 when absent) to each `InventoryResponse`; the sort is untouched.

### Frontend
- `ProductPurchasePanel`: swatches and size buttons are never `disabled` because of stock; they keep their "sold out" `aria-label`. Picking a color falls back to the color's first size when no size has stock (already the behavior of `variantToSelectWhenChoosingColor`).
- The actions area chooses by the selected variant: with stock, `AddToCartForm` (now only the "Add to cart" case); without stock, a new `NotifyMeForm` (`src/app/products/[id]/NotifyMeForm.tsx`) that renders "Notify me when it's back" (`SubmitButton`, busy while pending) or a disabled "Alert active" button when the variant id is in `alertedVariantIds` or the action succeeded. It is keyed by variant id, like `AddToCartForm`, so errors reset on selection.
- New server action `requestRestockAlert` (`src/app/actions/restock-alerts/`) maps `VariantNotFoundError` to "The selected variant is no longer available.", calls `revalidatePath` for the product page and returns a success state; it does not redirect.
- `InventoryTable` adds a "Waiting" column (`align: "end"`) after "Stock".

## Risks / Trade-offs

- [Alerts are never consumed, so "Waiting" keeps counting customers after a variant is restocked] → Accepted and stated in the spec; the future sending flow will remove or mark alerts once sent.
- [The fake session always returns the same user, so on a local run only one customer can create alerts] → Seed alerts from the other seeded users so the "Waiting" column shows counts above 1.
- [Enabling sold-out options changes the existing panel tests that assert disabled buttons] → Update those tests together with the panel change.

## Migration Plan

Add the table to `database/schema.sql` (drop it at the top, before `product_variants` and `users`) and seed rows to `database/seed.sql`; apply with `npm run db:reset` and `npm run db:test:reset`. Rollback: revert the change and reset the database; no other table depends on `restock_alerts`.
