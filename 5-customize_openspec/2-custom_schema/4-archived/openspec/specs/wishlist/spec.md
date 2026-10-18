# wishlist Specification

## Purpose

Lets customers save the products they like from the product page and find them again in their account. How many customers saved each product is shown to admins by the `stock-monitoring` capability.

## Requirements

### Requirement: Saving a product to the wishlist
The product page SHALL show a "Save to wishlist" button when the product is not in the current customer's wishlist. Clicking it SHALL add the product, whatever color and size is selected, to the customer's wishlist and keep the customer on the product page. While the request is in progress, the button SHALL be disabled and shown as busy.

#### Scenario: Customer saves a product
- **WHEN** a customer whose wishlist is empty clicks "Save to wishlist" on the "Hexagonal Overshirt" product page
- **THEN** the customer's wishlist holds "Hexagonal Overshirt", the page shows a "Remove from wishlist" button and the customer stays on the product page

#### Scenario: Saving does not depend on the selected variant
- **WHEN** a customer with "Moss / L" of the "Hexagonal Overshirt" selected clicks "Save to wishlist" and then picks "Indigo / S"
- **THEN** the page still shows the "Remove from wishlist" button

#### Scenario: Request in progress
- **WHEN** a customer clicks "Save to wishlist" and the request has not finished
- **THEN** the button is disabled and shown as busy

### Requirement: Removing a product from the wishlist
The product page SHALL show a "Remove from wishlist" button when the product is in the current customer's wishlist, both right after saving it and on later visits. Clicking it SHALL remove the product from the customer's wishlist, keep the customer on the product page and show the "Save to wishlist" button again. Wishlists SHALL be per customer: another customer's wishlist does not change the button.

#### Scenario: Later visit
- **WHEN** a customer who saved "Event Storm Knit" opens its product page
- **THEN** the page shows a "Remove from wishlist" button

#### Scenario: Customer removes a product
- **WHEN** a customer who saved "Event Storm Knit" clicks "Remove from wishlist" on its product page
- **THEN** the customer's wishlist no longer holds "Event Storm Knit" and the page shows a "Save to wishlist" button

#### Scenario: Product saved by another customer
- **WHEN** another customer saved "Event Storm Knit" and the current customer did not
- **THEN** the current customer sees a "Save to wishlist" button on its product page

### Requirement: Saving and removing are idempotent
A customer SHALL have a product at most once in the wishlist. Saving a product already in the wishlist SHALL leave it once, and removing a product not in the wishlist SHALL change nothing; neither SHALL show an error.

#### Scenario: Saving twice from a stale page
- **WHEN** a customer who already saved "Hexagonal Overshirt" clicks "Save to wishlist" on a page opened before the first save
- **THEN** the wishlist holds "Hexagonal Overshirt" once and the page shows the "Remove from wishlist" button

#### Scenario: Removing twice from a stale page
- **WHEN** a customer who no longer has "Hexagonal Overshirt" in the wishlist clicks "Remove from wishlist" on a page opened before the removal
- **THEN** the wishlist does not hold "Hexagonal Overshirt" and the page shows the "Save to wishlist" button

### Requirement: Saving a product no longer in the catalog
Saving a product that is no longer in the catalog SHALL be rejected with "This product is no longer available.", leaving the wishlist unchanged and the customer on the product page.

#### Scenario: Product removed after the page was opened
- **WHEN** a customer saves a product that was removed from the catalog after the product page was opened
- **THEN** the page shows "This product is no longer available." and the wishlist is unchanged

### Requirement: Wishlist page
The page /account/wishlist SHALL be titled "Wishlist" and SHALL list the products in the current customer's wishlist, most recently saved first, each showing its name and price and linking to its product page. With an empty wishlist, it SHALL read "Your wishlist is empty." The user menu SHALL offer a "Wishlist" link to this page next to "My orders".

#### Scenario: Products listed by saving date
- **WHEN** a customer saved "Hexagonal Overshirt" and later "Event Storm Knit", and opens /account/wishlist
- **THEN** the page lists "Event Storm Knit" first and "Hexagonal Overshirt" second, each linking to its product page

#### Scenario: Empty wishlist
- **WHEN** a customer with an empty wishlist opens /account/wishlist
- **THEN** the page reads "Your wishlist is empty."

#### Scenario: Reaching the page from the user menu
- **WHEN** a customer opens the user menu
- **THEN** it offers "My orders" and "Wishlist" links, and "Wishlist" leads to /account/wishlist

#### Scenario: Only the current customer's products
- **WHEN** another customer saved "Domain Event Tee" and the current customer did not
- **THEN** the current customer's /account/wishlist does not list "Domain Event Tee"
