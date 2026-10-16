# order-cancellation Specification

## Purpose

Defines how customers cancel orders they placed, how the cancelled units return to stock, and how the cancelled status shows to customers and admins.

## Requirements

### Requirement: Customer cancels a confirmed order
On their order detail page (`/account/orders/[id]`), a customer SHALL be able to cancel a confirmed order they placed with a single click, without a confirmation step and with no time limit since the order was placed. After cancelling, the order SHALL show the "Cancelled" status.

#### Scenario: Cancel a confirmed order
- Given a customer has a confirmed order, when they click "Cancel order" on its detail page, then the order shows the "Cancelled" status

#### Scenario: Old confirmed order
- Given a customer has a confirmed order placed months ago, when they click "Cancel order", then the order is cancelled

### Requirement: Cancel action only offered on confirmed orders
The order detail page SHALL show the "Cancel order" action only while the order is confirmed.

#### Scenario: Cancelled order has no cancel action
- Given a customer's order is cancelled, when they open its detail page, then no "Cancel order" action is shown

### Requirement: Cancelling an already cancelled order is a no-op
Cancelling an order that is already cancelled SHALL leave the order and stock unchanged and SHALL NOT show an error.

#### Scenario: Repeated cancellation
- Given an order is already cancelled (for example, from another browser tab), when the customer submits the cancellation again, then the order stays cancelled, stock is not increased again, and no error is shown

### Requirement: Customers cannot cancel other customers' orders
An attempt to cancel an order that belongs to another customer, or that does not exist, SHALL be treated as not found and SHALL leave the order and stock unchanged.

#### Scenario: Another customer's order
- Given an order placed by another customer, when the current customer attempts to cancel it, then the result is not found and the order stays confirmed

### Requirement: Cancelled units return to stock
When an order is cancelled, each line's quantity SHALL be added back to the online stock of its variant.

#### Scenario: Stock restored
- Given a variant has 3 units in stock and a confirmed order contains 2 units of it, when the order is cancelled, then the variant has 5 units in stock

#### Scenario: Order with several lines
- Given a confirmed order with 1 unit of variant A and 2 units of variant B, when it is cancelled, then variant A gains 1 unit and variant B gains 2 units

### Requirement: Cancelled status visible everywhere orders are listed
The "Cancelled" status SHALL show in the customer's order list and order detail, and in the admin orders list (`/admin/orders`) and admin order detail. Admin pages SHALL NOT offer a cancel action.

#### Scenario: Admin sees a cancelled order
- Given a customer cancelled an order, when an admin opens `/admin/orders` and the order's detail, then both show the "Cancelled" status and no cancel action
