# Design

## Context

See proposal.md - Why. Behaviour is in `specs/order-cancellation/spec.md`.

- `Order` (`orders/domain/Order.ts`) is immutable, its only status is `"confirmed"` (`orderStatuses`), and `OrderRepository` can only insert (`save`) and read. `orders.status` is already a free `text` column, so no migration is needed.
- Order lines are a snapshot (`variant_id` without a foreign key), so a line can point to a variant removed from the catalog.
- Stock is `product_variants.online_stock`. Checkout decreases it through the consumer-owned `StockReserver` port, adapted by `ProductsStockReserver` to the products use case `StockDecreaser`, all inside `UnitOfWork.run`. Postgres transactions nest through AsyncLocalStorage, so repositories called inside `run` share the transaction.
- Ownership: `UserOrderFinder` reads the current user from `CurrentUserProvider` and treats another customer's order as missing. Both customer and admin detail pages render the shared `OrderDetail` section; status labels come from `formatStatus` in `frontend/retail/ui/format.ts`.

## Goals / Non-Goals

**Goals:**
- Status change and stock return are atomic and happen at most once per order, even with two concurrent cancel requests.
- The cancel action is reachable only from the customer's detail page and only for the current customer's orders.

**Non-Goals:**
- Admin overview metrics (`revenuePerCurrency`, `OrdersSummaryGetter`, `DashboardMetrics`) are not filtered by status; they keep counting cancelled orders.
- No refunds, emails, order history/audit trail or stock movement log.
- No restock-alert notification when returned units bring a variant back from 0.

## Decisions

### 1. `Order.cancel()` returns a new cancelled order
Add `"cancelled"` to `orderStatuses` and an `isCancelled()`/`cancel()` pair on `Order`, `cancel()` returning a new immutable `Order` with status `"cancelled"`. Keeping the transition in the domain keeps the "confirmed → cancelled" rule out of the use case.
- Alternative: let the use case set the status string directly. Rejected: spreads the status rule into application code.

### 2. Persist with a conditional status update
Add `OrderRepository.cancel(order): Promise<boolean>` implemented as `update orders set status = 'cancelled' where id = $id and status = 'confirmed'`, returning whether a row changed. The use case returns stock only when it returns `true`. This makes "cancel twice" a no-op and closes the race between two tabs without explicit locking: the second update waits on the row lock and then matches 0 rows.
- Alternative: `select ... for update` then a generic `update`. Works too but needs two statements and a new locking read; the conditional update is enough.
- Alternative: make `save` an upsert. Rejected: it would also rewrite lines and hide the "only once" guarantee.

### 3. Return stock through a consumer-owned port
In orders, add a `StockReturner` port (`return(lines: { variantId, quantity }[])`) with a `ProductsStockReturner` adapter calling a new products use case `StockIncreaser`, which sorts by variant id (same deadlock-avoidance as `StockDecreaser`) and calls a new `ProductRepository.increaseStock(variantId, quantity)` (`update product_variants set online_stock = online_stock + $q where id = $id`). A removed variant simply updates 0 rows and is skipped, matching the spec. This follows the project rule that contexts only talk through consumer-owned ports to the provider's application layer.

### 4. `UserOrderCanceller` use case
`orders/application/cancel-mine/UserOrderCanceller.cancel(orderId)`:
1. Inside `unitOfWork.run`: load the order with `OrderRepository.search`, read the current user from `CurrentUserProvider`.
2. Missing order or other owner → throw a new `OrderNotFoundError` (extends `CodelyError`).
3. Already cancelled → return.
4. `repository.cancel(order.cancel())`; if it changed the row, `stockReturner.return(order.lines)`.
The current user is never taken from the form, as in `UserOrderFinder`.

### 5. UI: one-click form on the customer page only
A `cancelOrder` server action (`src/app/actions/orders/cancelOrder.ts`) reads the hidden `orderId`, calls the use case, maps `OrderNotFoundError` to "We couldn't find that order." through `actionStateFor`, and does `revalidatePath("/", "layout")` with no redirect. A `CancelOrderForm` client component (pattern of `DeleteOutfitForm`: `useActionState`, `SubmitButton mode="danger"`, `FormError`) is rendered by `src/app/account/orders/[id]/page.tsx` only when the order status is `confirmed`. `OrderDetail` gets an optional `actions` slot so the admin page, which passes nothing, never shows it. `formatStatus` gains `cancelled: "Cancelled"`, which every status pill already uses. The `/admin/orders` header becomes `${orders.length} orders.`.

## Risks / Trade-offs

- [Admin revenue and order count include cancelled orders] → Accepted and stated as a non-goal; a later change can filter `revenuePerCurrency` by status.
- [Units of a removed variant are lost] → Accepted; there is no variant to return them to and the spec states it.
- [A customer can cancel an order already shipped in real life] → Accepted per the product decision "any confirmed order, any time"; there is no fulfilment state yet.
- [No confirmation dialog means accidental cancels] → Accepted per the product decision; the order cannot be un-cancelled, so this is the main UX risk to revisit.

## Migration Plan

No schema change. Deploy as usual; rollback is safe as long as the previous code can read the `"cancelled"` status — it cannot (`parseOrderStatus` would throw), so rolling back after an order is cancelled requires resetting those orders to `confirmed` or redeploying this version.
