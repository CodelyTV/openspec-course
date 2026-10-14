## Purpose

Lets customers cancel an order they placed from its detail in My orders, returning its units to stock, and shows cancelled orders as such to customers and admins.

## ADDED Requirements

### Requirement: Cancelling an order from its detail
The system SHALL show a "Cancel order" button on the customer's detail of a confirmed order, and clicking it SHALL cancel the order at once, without asking for confirmation, keeping the customer on the order detail. While the request is in progress, the button SHALL be disabled and shown as busy.

#### Scenario: Customer cancels a confirmed order
- Given a customer on the detail of their confirmed order, when they click "Cancel order", then they stay on the order detail, its status reads "Cancelled" and the "Cancel order" button is gone

#### Scenario: Cancellation in progress
- Given a customer clicked "Cancel order", when the request has not finished, then the button is disabled and shown as busy

### Requirement: Cancelled order detail
The system SHALL show the status "Cancelled" and no "Cancel order" button on the customer's detail of a cancelled order.

#### Scenario: Customer opens a cancelled order
- Given a customer with a cancelled order, when they open its detail in My orders, then the status reads "Cancelled" and there is no "Cancel order" button

### Requirement: Cancelled units go back into stock
The system SHALL add the quantity of every line of a cancelled order back to the online stock of its variant, in the same step that cancels the order. A line whose variant is no longer in the catalog SHALL be skipped without preventing the cancellation.

#### Scenario: Units of a cancelled order are back in stock
- Given "Hexagonal Overshirt" Moss / L has 0 units and a confirmed order contains 2 units of it, when the customer cancels the order, then "Hexagonal Overshirt" Moss / L has 2 units in stock

#### Scenario: Variant removed from the catalog
- Given a confirmed order with a line whose variant was removed from the catalog and a line of a variant still in the catalog, when the customer cancels the order, then the order is cancelled and only the variant still in the catalog gets its units back

### Requirement: Cancelling an already cancelled order
The system SHALL treat cancelling an order that is already cancelled as a no-op: no error is shown, the order stays cancelled and no units are added to stock again.

#### Scenario: Cancelling twice
- Given a customer cancelled an order from another tab, when they click "Cancel order" on a detail page opened before, then no error is shown, the status reads "Cancelled" and the stock is the same as after the first cancellation

### Requirement: Order of another customer
The system SHALL report cancelling an order that does not exist or belongs to another customer with "This order was not found.", leaving every order and the stock unchanged.

#### Scenario: Order placed by another customer
- Given an order placed by another customer, when the current customer asks to cancel it, then "This order was not found." is shown and the order and the stock stay unchanged

### Requirement: Cancelled status in My orders
The system SHALL keep cancelled orders in the customer's My orders list with the status "Cancelled".

#### Scenario: Cancelled order in the list
- Given a customer with a cancelled order and a confirmed order, when they open My orders, then both orders are listed, the cancelled one with the status "Cancelled" and the other with "Confirmed"

### Requirement: Cancelled status in the admin orders
The system SHALL show the status "Cancelled" for cancelled orders in the admin orders list and SHALL describe the list as "<N> orders." ("1 order." for a single order), counting every order whatever its status.

#### Scenario: Cancelled order in the admin list
- Given one cancelled and two confirmed orders, when an admin opens the admin orders, then the page reads "3 orders." and the cancelled order's row shows the status "Cancelled"

### Requirement: Admin order detail of a cancelled order
The system SHALL show the status "Cancelled" on the admin detail of a cancelled order, and the admin detail SHALL NOT offer a way to cancel any order.

#### Scenario: Admin opens a cancelled order
- Given a cancelled order, when an admin opens its detail, then the status reads "Cancelled"

#### Scenario: Admin opens a confirmed order
- Given a confirmed order, when an admin opens its detail, then the status reads "Confirmed" and there is no "Cancel order" button
