---
name: "add-order-cancellation"
description: "Customers cancel their confirmed orders from My orders, the units go back into stock and admins see the cancelled status."
created_at: "2026-10-14T15:11:53Z"

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
last_implementation_at: "2026-10-14T15:20:04Z"
---

# Order cancellation

## Goal

Customers can cancel a confirmed order with one click from `/account/orders/[id]`, and its units go back into online stock in the same transaction, so sold units become available again. Admins see the "Cancelled" status in `/admin/orders` and the admin order detail.

## Decisions

- Any confirmed order can be cancelled at any time, with one click and no confirmation dialog.
- Cancelling an already cancelled order is a no-op without error and returns no units again.
- A missing order and another customer's order both fail with `OrderNotFoundError`, shown as "This order was not found.".
- Admins cannot cancel: only the customer detail renders the "Cancel order" form.
- The status change and the stock increase run in one `UnitOfWork`, locking the order row, so concurrent cancellations return the units once.
- Lines whose variant is no longer in the catalog are skipped (the guarded update touches 0 rows) and do not block the cancellation.
- After cancelling, the customer stays on the order detail (revalidate, no redirect).
- `orders.status` is already free text: no schema change, only the new `cancelled` value, documented in the data model.
- Admin orders description changes from "N confirmed orders." to "N orders." because it would be wrong with cancelled orders.
- Seed data keeps every order confirmed.
- Out of scope: admin overview revenue metrics (cancelled orders still count), restock alert notifications, refunds, partial cancellations.

## Context

- [`src/contexts/backend/orders/domain/Order.ts`](/src/contexts/backend/orders/domain/Order.ts): order statuses and the aggregate to cancel.
- [`src/contexts/backend/orders/infrastructure/PostgresOrderRepository.ts`](/src/contexts/backend/orders/infrastructure/PostgresOrderRepository.ts): needs a locking read and a status update.
- [`src/contexts/backend/checkout/application/confirm/CheckoutConfirmer.ts`](/src/contexts/backend/checkout/application/confirm/CheckoutConfirmer.ts): `UnitOfWork` pattern across contexts.
- [`src/contexts/backend/checkout/infrastructure/ProductsStockReserver.ts`](/src/contexts/backend/checkout/infrastructure/ProductsStockReserver.ts): consumer-owned port over a Products use case, copied for releasing stock.
- [`src/contexts/backend/products/application/decrease-stock/StockDecreaser.ts`](/src/contexts/backend/products/application/decrease-stock/StockDecreaser.ts): pattern for `StockIncreaser`.
- [`src/app/admin/outfits/DeleteOutfitForm.tsx`](/src/app/admin/outfits/DeleteOutfitForm.tsx) and [`src/app/actions/checkout/removeCartLine.ts`](/src/app/actions/checkout/removeCartLine.ts): one-click form and server action without redirect.
- [`src/contexts/frontend/retail/sections/OrderDetail.tsx`](/src/contexts/frontend/retail/sections/OrderDetail.tsx) and [`src/contexts/frontend/retail/ui/format.ts`](/src/contexts/frontend/retail/ui/format.ts): order detail and status labels.
- [`tests/backend/acceptance/CheckoutConfirmation.spec.ts`](/tests/backend/acceptance/CheckoutConfirmation.spec.ts): acceptance test pattern for the cancellation flow.

## Phases

### Phase 1: Customers cancel an order and its units return to stock

A customer cancels a confirmed order from its detail, sees it as "Cancelled" in the detail and in My orders, and the variants get their units back.

**Contracts**

- Domain: `orderStatuses = ["confirmed", "cancelled"]`, `Order.cancel(): Order`, `Order.isCancelled(): boolean`, `OrderNotFoundError(orderId: string)`
- Port: `OrderRepository.searchLockingIt(id: OrderId): Promise<Order | null>`, `OrderRepository.updateStatus(order: Order): Promise<void>`
- Port: `StockReleaser.release(lines: OrderLine[]): Promise<void>` (orders domain), adapter `ProductsStockReleaser(stockIncreaser: StockIncreaser)`
- Application service: `StockIncreaser(repository: ProductRepository).increase(increases: StockIncrease[]): Promise<void>`, `StockIncrease = { variantId: string; quantity: number }`
- Repository: `ProductRepository.increaseStock(variantId: VariantId, quantity: number): Promise<void>`
- Application service: `UserOrderCanceller(repository: OrderRepository, stockReleaser: StockReleaser, currentUserProvider: CurrentUserProvider, unitOfWork: UnitOfWork).cancel(id: string): Promise<void>`, registered as `retailContainer.userOrderCanceller`
- Server action: `cancelOrder(_previousState: ActionState, formData: FormData): Promise<ActionState>`, `requiredOrderId(formData: FormData): string`
- UI: `CancelOrderForm({ orderId: string })`, `OrderDetail({ order, audience, cancelForm?: ReactNode })` rendering `cancelForm` only for `audience="customer"` and status `confirmed`
- UI copy: "Cancel order", "Cancelled", "This order was not found."
- Test suite `UserOrderCanceller should`: "cancel a confirmed order of the current customer and release its units", "do nothing when the order is already cancelled", "fail with order not found when the order belongs to another customer", "fail with order not found when the order does not exist"
- Test suite `StockIncreaser should`: "increase the online stock of every variant"
- Test suite `PostgresProductRepository should`: "increase the online stock of a variant", "ignore an increase for a variant no longer in the catalog"
- Test suite `PostgresOrderRepository should`: "update the status of an order", "find an order locking it"
- Test suite `Order cancellation across orders and products should`: "return the units of a cancelled order to stock", "return the units only once when the order is cancelled twice", "cancel an order with a variant no longer in the catalog"
- Test suite `CancelOrderForm should`: "send the order id when clicking Cancel order", "disable the button while cancelling", "show the error when the order was not found"
- Test suite `OrderDetail should`: "show the cancel form to the customer of a confirmed order", "show the cancelled status and no cancel form to the customer of a cancelled order"
- Test suite `CustomerOrdersTable should`: "show the cancelled status of a cancelled order"
- Test suite `format should`: "format the cancelled status"

- [x] Add the `cancelled` status, `Order.cancel()`, `Order.isCancelled()`, `OrderNotFoundError` and `OrderRepository.searchLockingIt`/`updateStatus` with their Postgres implementation and integration tests
- [x] Add `ProductRepository.increaseStock` (guarded update tolerating 0 rows) and the `StockIncreaser` use case with its unit and integration tests
- [x] Add the `StockReleaser` port, the `ProductsStockReleaser` adapter and the `UserOrderCanceller` use case in one `UnitOfWork`, register it in `RetailContainer`, and cover it with unit tests and the `OrderCancellation.spec.ts` acceptance test
- [x] Add the `cancelOrder` server action (maps `OrderNotFoundError` to "This order was not found.", revalidates, no redirect) and `CancelOrderForm` with its frontend tests
- [x] Add the `cancelForm` slot to `OrderDetail`, render `CancelOrderForm` from `/account/orders/[id]`, add the "Cancelled" label to `format.ts` and cover `OrderDetail`, `CustomerOrdersTable` and `format`
- [x] Document the `cancelled` status and the stock release in `docs/sql-database/data-model.md` and the cancel button in `docs/architecture/screens.md` for `/account/orders/[id]`
- [x] Verify typecheck, lint and every test suite with the project's verification commands. Fix issues if any.

### Phase 2: Admins see cancelled orders

The admin orders list and the admin order detail show cancelled orders as "Cancelled" without any way to cancel, and the list description counts every order.

**Contracts**

- UI copy: "<N> orders." ("1 order." for a single order) in `/admin/orders`, with `formatOrderCount(count: number): string`
- Test suite `AdminOrdersTable should`: "show the cancelled status of a cancelled order"
- Test suite `OrderDetail should`: "show the cancelled status to admins", "show no cancel form to admins of a confirmed order"

- [x] Change the `/admin/orders` description to "N orders." and cover the cancelled status in `AdminOrdersTable` and the admin `OrderDetail`, including no cancel form for admins
- [x] Update `docs/architecture/screens.md` for `/admin/orders` and `/admin/orders/[id]` to mention the "Cancelled" status
- [x] Verify typecheck, lint and every test suite with the project's verification commands. Fix issues if any.

## Next step

Every phase is implemented and verified. Run `/openspec-verify-change` to check the implementation against the specs, then `/openspec-archive-change` to archive the change.

Cancelled orders roll back to the shelf faster than Turbotuga 🐢 💨 on a Friday deploy, cheered on by [Codely](https://codely.com).
