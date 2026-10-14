# Spec Delta

## Purpose

Lets customers cancel orders they placed, returns the cancelled units to stock, and shows the cancelled status to customers and admins.

## ADDED Requirements

### Requirement: Customer cancels a confirmed order
The customer's order detail page SHALL show a "Cancel order" button for a confirmed order, and one click on it SHALL change the order's status to "Cancelled" without asking for confirmation, keeping the customer on the same page.

#### Scenario: Cancelling a confirmed order
- Given a customer viewing one of their confirmed orders, when they click "Cancel order", then the page shows the status "Cancelled" and no "Cancel order" button.

### Requirement: Cancelled units go back into stock
Cancelling an order SHALL add each line's quantity back to the online stock of the variant it was bought in.

#### Scenario: Units returned to their variants
- Given an order with 2 units of "Hexagonal Overshirt" Moss / M, which now has 1 unit in stock, when the customer cancels it, then Moss / M has 3 units in stock.

#### Scenario: Variant no longer in the catalog
- Given an order with a line whose variant was removed from the catalog, when the customer cancels it, then the order is cancelled and the units of its other lines go back into stock.

### Requirement: Cancelling a cancelled order changes nothing
Cancelling an order that is already cancelled SHALL leave the order and the stock unchanged and SHALL NOT show an error.

#### Scenario: Cancelling twice
- Given an order already cancelled from another tab, when the customer clicks "Cancel order" on a page opened before, then the order stays cancelled, no units are returned again and no error is shown.

### Requirement: Only the customer's own orders can be cancelled
Cancelling an order that does not exist or belongs to another customer SHALL be rejected as not found, changing no order and no stock.

#### Scenario: Another customer's order
- Given an order placed by another customer, when the current customer asks to cancel it, then they see "We couldn't find that order." and the order and the stock are unchanged.

### Requirement: Cancelled status is shown everywhere
A cancelled order SHALL show the status "Cancelled" in My orders, in the customer's order detail, in the admin orders list and in the admin order detail.

#### Scenario: Admin sees the cancelled order
- Given a customer cancelled an order, when an admin opens the orders list and that order's detail, then both show the status "Cancelled".

### Requirement: Admins cannot cancel orders
The admin order detail SHALL NOT offer a way to cancel the order, whatever its status.

#### Scenario: Admin opens a confirmed order
- Given a confirmed order, when an admin opens its detail, then the page shows no "Cancel order" button.
