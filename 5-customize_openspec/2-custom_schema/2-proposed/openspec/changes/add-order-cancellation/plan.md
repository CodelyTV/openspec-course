---
name: "add-order-cancellation"
description: "Customers cancel their own confirmed orders and the units go back into stock."
created_at: "2026-10-16T00:00:00Z"

created_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"
---

# Customers cancel their own orders

## Goal

Customers can cancel a confirmed order from `/account/orders/[id]` in one click. Its units return to online stock, and the "Cancelled" status shows in every customer and admin order view.

## Decisions

- New `cancelled` value in `orderStatuses`; `orders.status` is free `text`, so no schema migration is needed.
- `Order.cancel()` returns a new cancelled `Order` and returns itself unchanged when already cancelled (instead of throwing), so the no-op rule lives in the domain.
- The repository transitions the status with a conditional `update ... where status = 'confirmed'` that reports whether it changed anything; stock is released only when it did. This keeps double clicks and parallel tabs from restocking twice (instead of read, check, save).
- The status update and the stock release run in one transaction, so a failed restock never leaves a cancelled order without its units back.
- Ownership reuses `UserOrderFinder` semantics: an order of another user or a missing id raises `OrderNotFoundError`, which the server action turns into `notFound()`.
- Orders reach stock through a consumer-owned `StockReleaser` port in `orders/domain`, adapted in `orders/infrastructure` to a new `products` application use case `StockIncreaser` (mirrors `checkout`'s `StockReserver` / `ProductsStockReserver` over `StockDecreaser`).
- The cancel button is a plain `<form action>` with a server action, no client confirmation and no pending error state.
- Out of scope: admin revenue metrics (`revenuePerCurrency` and dashboard summary keep counting cancelled orders), restock alerts triggered by released stock, admin cancellation, refunds.

## Phases

### Phase 1: Customer cancels an order and stock is restored

The customer sees a "Cancel order" button on a confirmed order, clicks it, and the order shows "Cancelled" in their pages and in admin; the variants regain the units.

**Contracts**

```ts
// Domain (orders)
export const orderStatuses = ["confirmed", "cancelled"] as const;
class Order { cancel(): Order; isCancelled(): boolean }
class OrderNotFoundError extends Error { constructor(id: string) }

// Ports and repositories (orders)
abstract class OrderRepository { abstract cancel(id: OrderId): Promise<boolean> } // true when it moved confirmed -> cancelled
abstract class StockReleaser { abstract release(lines: OrderLine[]): Promise<void> }

// Application services
class UserOrderCanceller { cancel(id: string): Promise<void> } // orders/application/cancel-mine
class StockIncreaser { increase(increases: StockIncrease[]): Promise<void> } // products/application/increase-stock
type StockIncrease = { variantId: string; quantity: number };

// Ports and repositories (products)
abstract class ProductRepository { abstract increaseStock(variantId: VariantId, quantity: number): Promise<void> }

// Server action
export async function cancelOrder(orderId: string): Promise<void> // src/app/actions/orders/cancelOrder.ts

// UI copy
"Cancel order" (button), "Cancelled" (status label)
```

**Tests**

- `tests/backend/orders/domain/Order.spec.ts` (`Order should`)
  - cancel a confirmed order (Cancel a confirmed order)
  - keep an already cancelled order unchanged (Repeated cancellation)
- `tests/backend/orders/application/cancel-mine/UserOrderCanceller.spec.ts` (`UserOrderCanceller should`)
  - cancel an order placed by the current user and release its lines (Cancel a confirmed order, Order with several lines)
  - cancel an order placed long ago (Old confirmed order)
  - not release stock when the order was already cancelled (Repeated cancellation)
  - throw not found for an order placed by another user without touching it (Another customer's order)
  - throw not found when the order does not exist (Another customer's order)
- `tests/backend/products/application/increase-stock/StockIncreaser.spec.ts` (`StockIncreaser should`)
  - increase the stock of every variant (Stock restored, Order with several lines)
- `tests/backend/orders/infrastructure/PostgresOrderRepository.spec.ts`
  - cancel a confirmed order and report the change (Cancel a confirmed order)
  - report no change when cancelling an already cancelled order (Repeated cancellation)
- `tests/backend/products/infrastructure/PostgresProductRepository.spec.ts`
  - add units to a variant's online stock (Stock restored)
- `tests/frontend/retail/sections/OrderDetail.spec.tsx`
  - show the cancel button on a confirmed customer order (Cancel a confirmed order)
  - hide the cancel button on a cancelled order (Cancelled order has no cancel action)
  - hide the cancel button for admins and show "Cancelled" (Admin sees a cancelled order)

- [ ] Add `cancelled` to `orderStatuses` and `Order.cancel()` / `isCancelled()` in `src/contexts/backend/orders/domain/Order.ts`, plus `OrderNotFoundError` next to `EmptyOrderError`; extend `OrderMother` with a cancelled variant.
- [ ] Add `increaseStock` to `ProductRepository` and `PostgresProductRepository` (copy `decreaseStockIfEnoughUnitsLeft`), and `StockIncreaser` in `products/application/increase-stock` (copy `StockDecreaser`, keeping the stable variant order against deadlocks).
- [ ] Add `cancel(id)` to `OrderRepository` and `PostgresOrderRepository` as a conditional status update returning whether a row changed.
- [ ] Add the `StockReleaser` port in `orders/domain` and `ProductsStockReleaser` in `orders/infrastructure` over `StockIncreaser` (copy `checkout/infrastructure/ProductsStockReserver.ts`).
- [ ] Add `UserOrderCanceller` in `orders/application/cancel-mine`: load the order, check it belongs to `CurrentUserProvider` (as `UserOrderFinder` does), call `repository.cancel` and `stockReleaser.release` inside one transaction, only when the status changed. Wire it in `RetailContainer`.
- [ ] Add the `cancelOrder` server action in `src/app/actions/orders/` (copy `actions/checkout/confirmOrder.ts`): map `OrderNotFoundError` to `notFound()`, then `revalidatePath("/", "layout")`.
- [ ] Add the "Cancelled" label to `statusLabels` in `src/contexts/frontend/retail/ui/format.ts`, and a "Cancel order" form in `OrderDetail` rendered only for `audience="customer"` and `status === "confirmed"` (copy the form pattern in `src/app/admin/outfits/DeleteOutfitForm.tsx`).
- [ ] Verify typecheck, lint and every test suite with the project's verification commands, and check the phase's behaviour in the running app. Fix issues if any.

## Next step

Run `/openspec-apply-change` to implement every phase.

Cancelled orders head back to the shelf faster than Turbotuga™ on a downhill 🐢 💨 ([Codely](https://codely.com))
