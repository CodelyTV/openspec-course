# restock-alerts Specification

## Purpose

Lets customers ask, from the product page, to be told when a sold-out color and size of a product is back in stock, and keeps track of who is waiting for each variant.

## Requirements

### Requirement: Requesting a restock alert
For a selected variant without stock, the product page SHALL show a "Notify me when it's back" button instead of the add to cart button. Clicking it SHALL register an alert of the current customer for that variant and keep the customer on the product page. While the request is in progress, the button SHALL be disabled and shown as busy.

#### Scenario: Sold-out size selected
- **WHEN** a customer on the "Hexagonal Overshirt" product page picks the size "L" with the "Moss" color selected
- **THEN** the page shows an enabled "Notify me when it's back" button and no "Add to cart" button

#### Scenario: Customer asks to be notified
- **WHEN** a customer with no alerts clicks "Notify me when it's back" with "Moss / L" of the "Hexagonal Overshirt" selected
- **THEN** the customer has an alert for "Hexagonal Overshirt" Moss / L and stays on the product page

#### Scenario: Request in progress
- **WHEN** a customer clicks "Notify me when it's back" and the request has not finished
- **THEN** the button is disabled and shown as busy

### Requirement: Active restock alert
When the current customer has an alert for the selected variant and the variant has no stock, the product page SHALL show a disabled "Alert active" button instead of the "Notify me when it's back" button, both right after requesting it and on later visits. The page SHALL NOT offer a way to cancel the alert. Alerts SHALL be per customer: another customer's alert does not make it active.

#### Scenario: Right after asking
- **WHEN** a customer clicks "Notify me when it's back" with "Black / M" of the "Merge Conflict Jeans" selected
- **THEN** the page shows a disabled "Alert active" button and no "Notify me when it's back" button

#### Scenario: Later visit
- **WHEN** a customer who has an alert for "Merge Conflict Jeans" Black / M opens that product page and picks the "Black" color
- **THEN** the selected variant reads "Black / M. Online stock: 0" and the page shows a disabled "Alert active" button

#### Scenario: Alert of another customer
- **WHEN** another customer has an alert for "Merge Conflict Jeans" Black / M and the current customer has none
- **THEN** the current customer sees an enabled "Notify me when it's back" button for Black / M

#### Scenario: Alert only for the variant it was requested for
- **WHEN** a customer who has an alert only for "Merge Conflict Jeans" Black / M opens that product page
- **THEN** the initially selected "Indigo / S" variant shows an enabled "Notify me when it's back" button

### Requirement: One alert per customer and variant
A customer SHALL have at most one alert per variant. Requesting an alert for a variant the customer already has an alert for SHALL leave a single alert and SHALL NOT show an error.

#### Scenario: Asking twice
- **WHEN** a customer who already has an alert for "Hexagonal Overshirt" Moss / L asks again to be notified for Moss / L, for example from a page opened before the first request
- **THEN** the customer still has a single alert for that variant and the page shows the disabled "Alert active" button

### Requirement: Alert for a variant no longer in the catalog
Requesting an alert for a variant that is no longer in the catalog SHALL be rejected with "The selected variant is no longer available.", registering no alert and leaving the customer on the product page.

#### Scenario: Variant removed after the page was opened
- **WHEN** a customer asks to be notified for a variant that was removed from the catalog after the product page was opened
- **THEN** the page shows "The selected variant is no longer available." and no alert is registered
