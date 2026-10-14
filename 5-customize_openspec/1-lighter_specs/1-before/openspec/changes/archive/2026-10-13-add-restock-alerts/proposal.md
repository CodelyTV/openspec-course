# Proposal

## Why

When a size or color is sold out, the product page leaves the customer at a dead end: the sold-out options cannot even be selected and the only button reads "Sold out". The demand is lost, and admins have no way to know which sold-out variants customers actually want, so they cannot prioritize what to restock.

## What Changes

- Product page (`/products/[id]`): sold-out colors and sizes become selectable. They keep their "sold out" label, and picking them shows the variant with "Online stock: 0".
- Product page: for a selected variant without stock, the disabled "Sold out" button is replaced by a "Notify me when it's back" button. Clicking it registers a restock alert of the current customer for that variant, and the customer stays on the product page.
- Product page: when the current customer already has an alert for the selected sold-out variant, the page shows a disabled "Alert active" button instead. An alert cannot be cancelled.
- A customer has at most one alert per variant: asking again does not create a second one.
- Admin inventory (`/admin/inventory`): a new "Waiting" column shows, per variant, how many customers have an alert for it. The inventory order (stock ascending, then product name, then size) does not change.
- A product without variants keeps its disabled "Sold out" button.
- **Out of scope**: sending the notification. There is no restock flow and no email sending in the project, so alerts are only recorded and counted; nothing consumes them yet. Cancelling an alert is also out of scope.

## Capabilities

### New Capabilities
- `restock-alerts`: Customers asking to be told when a sold-out variant is back — requesting an alert from the product page, seeing it active, and the rule of one alert per customer and variant.

### Modified Capabilities
- `product-detail`: sold-out colors and sizes become selectable (Choosing a color, Choosing a size), and a selected variant without stock no longer shows a disabled "Sold out" button (Add to cart button, Initial variant selection).
- `stock-monitoring`: the inventory gains a "Waiting" column with the number of customers waiting for each variant.

## Impact

- **Database**: new `restock_alerts` table in `database/schema.sql` (one row per customer and variant), plus a few seed alerts in `database/seed.sql`.
- **Backend (`products` context)**: new `RestockAlert` domain object and `RestockAlertRepository` port with a Postgres adapter; new use cases to request an alert and to find the current customer's alerts for a product, both using the shared `CurrentUserProvider`; `InventoryLister` responses gain a `waiting` count. `RetailContainer` wires the new use cases.
- **Frontend**: `ProductPurchasePanel` enables sold-out swatches and sizes; a new `NotifyMeForm` with its server action replaces the sold-out state of `AddToCartForm`; the product page reads the current customer's alerts; `InventoryTable` gains the "Waiting" column.
- **Docs**: `docs/architecture/screens.md` and `docs/sql-database/data-model.md` describe the new behavior and table.
- No new dependencies. No breaking changes.
