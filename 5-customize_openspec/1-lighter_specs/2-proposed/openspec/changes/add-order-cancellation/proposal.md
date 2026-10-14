# Proposal

## Why

Customers who change their mind after placing an order have no way to undo it: every order stays "Confirmed" forever and its units stay out of stock, so they cannot be sold to anyone else. Letting customers cancel their own orders frees that stock and gives admins an accurate picture of which orders still stand.

## What Changes

- Customers can cancel a confirmed order of their own from its detail page in My orders (`/account/orders/[id]`) with a single "Cancel order" click, without a confirmation dialog and at any time after placing it.
- A cancelled order gets the new "Cancelled" status, which replaces "Confirmed" everywhere the order's status is shown: My orders, the customer's order detail, the admin orders list (`/admin/orders`) and the admin order detail.
- Cancelling an order puts every unit of its lines back into the online stock of the variant it was bought in.
- Cancelling an order that is already cancelled changes nothing and returns no units twice.
- Cancelling an order that does not exist or belongs to another customer is rejected as not found and changes nothing.
- Admins cannot cancel orders: the admin order detail shows the status but offers no cancel action.

Assumptions made without a human available (recorded so they can be challenged in review):
- A cancelled order's detail page shows no cancel button; the status is the only feedback, and the customer stays on the same page.
- When a variant of a cancelled order is no longer in the catalog, its units are not returned anywhere and the rest of the order is still cancelled.
- Returning units does not notify anyone: restock alerts only record who is waiting today, so nothing reacts to the stock going up.
- The admin orders header ("N confirmed orders.") stops calling every order confirmed and reads "N orders."
- Admin overview metrics (revenue, number of orders, average order) keep counting every order, cancelled or not; adjusting them is out of scope for this change.

## Capabilities

### New Capabilities
- `order-cancellation`: how a customer cancels one of their own orders, what happens to the order's stock, and how the cancelled status is shown to customers and admins.

### Modified Capabilities
<!-- None: no existing spec covers orders or the stock of placed orders. -->

## Impact

- Orders backend context: new "cancelled" order status, a cancel transition on the order, a customer-facing cancel use case with the same ownership check as the customer's order detail, and a way to persist a status change (the repository only inserts today).
- Products backend context: a use case to increase a variant's online stock, reached from orders through a consumer-owned port (mirroring how checkout reserves stock), run in the same transaction as the status change.
- App: a new server action and a "Cancel order" form on `/account/orders/[id]`; the "Cancelled" status label in the shared status formatting; the `/admin/orders` header wording.
- Database: no schema change (`orders.status` is already free text); the seed keeps only confirmed orders.
- Docs: `docs/architecture/screens.md` for `/account/orders/[id]`.
