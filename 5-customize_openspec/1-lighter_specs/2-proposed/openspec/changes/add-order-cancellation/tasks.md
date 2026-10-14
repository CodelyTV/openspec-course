# Tasks

## 1. Orders domain: cancelled status

- [ ] 1.1 Add `"cancelled"` to `orderStatuses` and `isCancelled()`/`cancel()` (returns a new `Order` with status `"cancelled"`) to `Order`, and verify a unit test in `tests/backend/orders/domain/` covers cancelling a confirmed order and that the original order is unchanged
- [ ] 1.2 Add `OrderNotFoundError` (extends `CodelyError`) in `orders/domain/errors/` and verify `npm run typecheck` passes

## 2. Products: increasing stock

- [ ] 2.1 Add `ProductRepository.increaseStock(variantId, quantity)` and its Postgres implementation (`online_stock = online_stock + quantity`, 0 rows for an unknown variant), and verify `tests/backend/products/infrastructure/PostgresProductRepository.spec.ts` covers an existing and a removed variant (`npm run test:integration`)
- [ ] 2.2 Add the `StockIncreaser` use case in `products/application/increase-stock/` (sorted by variant id, like `StockDecreaser`) and verify its unit test covers several lines and the call order

## 3. Orders backend: cancelling an order once

- [ ] 3.1 Add `OrderRepository.cancel(order): Promise<boolean>` implemented in `PostgresOrderRepository` as a conditional update (`where id = ... and status = 'confirmed'`), and verify `tests/backend/orders/infrastructure/PostgresOrderRepository.spec.ts` covers the first cancel returning true, a second returning false, and reading the order back as `"cancelled"`
- [ ] 3.2 Add the consumer-owned `StockReturner` port in orders and the `ProductsStockReturner` adapter calling `StockIncreaser`, and verify `npm run typecheck` and `npm run lint` pass (no cross-context domain/infrastructure imports)
- [ ] 3.3 Implement `UserOrderCanceller` in `orders/application/cancel-mine/` (inside `UnitOfWork.run`, owner from `CurrentUserProvider`, `OrderNotFoundError` for a missing or foreign order, no-op when already cancelled, stock returned only when `cancel` changed the row) and verify its unit test covers those four cases with `OrderMother`
- [ ] 3.4 Register the repository method, adapter and use case in `RetailContainer` and verify `npm run typecheck` passes
- [ ] 3.5 Add `tests/backend/acceptance/OrderCancellation.spec.ts` with real Postgres repositories (pattern of `CheckoutConfirmation.spec.ts`) and verify `npm run test:integration` shows the order cancelled and its units back in stock, a second cancel returning no extra units, and another customer's order left untouched

## 4. Customer and admin UI

- [ ] 4.1 Add `cancelled: "Cancelled"` to the status labels in `frontend/retail/ui/format.ts` and verify `tests/frontend/retail/ui/format.spec.ts` covers it, and that `AdminOrdersTable.spec.tsx` and `CustomerOrdersTable.spec.tsx` show "Cancelled" for a cancelled order
- [ ] 4.2 Add an optional `actions` slot to `OrderDetail` and verify `tests/frontend/retail/sections/OrderDetail.spec.tsx` renders it when given, shows "Cancelled" for a cancelled order, and renders no actions when none are passed (admin)
- [ ] 4.3 Add the `cancelOrder` server action in `src/app/actions/orders/` (hidden `orderId`, `OrderNotFoundError` mapped to "We couldn't find that order.", `revalidatePath("/", "layout")`, no redirect) and verify `npm run typecheck` passes
- [ ] 4.4 Add `CancelOrderForm` ("Cancel order", `SubmitButton mode="danger"`, busy while pending, `FormError`) and verify a test in `tests/app/account/orders/[id]/CancelOrderForm.spec.tsx` covers submitting the order id, the pending state and the error message
- [ ] 4.5 Render `CancelOrderForm` from `src/app/account/orders/[id]/page.tsx` only for confirmed orders, change the `/admin/orders` header to "N orders.", and verify `npm run build` passes
- [ ] 4.6 Update `docs/architecture/screens.md` for `/account/orders/[id]` and verify it mentions cancelling a confirmed order

## 5. Integration check

- [ ] 5.1 Run `make checks` and `npm run test:integration` and verify both pass
- [ ] 5.2 With `npm run dev` after `npm run db:reset`, cancel one of the current customer's orders from `/account/orders/[id]` and verify it shows "Cancelled" with no button, its variants' stock went up in `/admin/inventory`, `/admin/orders` and its admin detail show "Cancelled", and the admin detail has no "Cancel order" button
