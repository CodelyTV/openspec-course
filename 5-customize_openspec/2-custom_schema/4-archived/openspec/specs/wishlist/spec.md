# wishlist Specification

## Purpose

Lets customers save the products they like from the product page and review them in their account, and keeps track of how many customers want each product.

## Requirements

### Requirement: Saving a product to the wishlist
The product page SHALL show a "Save to wishlist" button for the current customer when the product is not in their wishlist. Clicking it SHALL add the product, not a specific color or size, to the customer's wishlist and keep the customer on the product page. While the request is in progress, the button SHALL be disabled and shown as busy.

#### Scenario: Customer saves a product
- Given a customer whose wishlist is empty is on the "Hexagonal Overshirt" product page, when they click "Save to wishlist", then the "Hexagonal Overshirt" is in their wishlist and they stay on the product page

#### Scenario: Saving does not depend on the selected variant
- Given a customer on the "Hexagonal Overshirt" product page has "Moss / L", which has no stock, selected, when they click "Save to wishlist", then the "Hexagonal Overshirt" is in their wishlist

#### Scenario: Product without variants
- Given a customer opens the page of a product that has no variants, when the page loads, then it shows the "Save to wishlist" button next to the disabled "Sold out" button

#### Scenario: Request in progress
- Given a customer clicked "Save to wishlist", when the request has not finished, then the button is disabled and shown as busy

### Requirement: Removing a product from the wishlist
When the product is in the current customer's wishlist, the product page SHALL show a "Remove from wishlist" button instead of "Save to wishlist", both right after saving it and on later visits. Clicking it SHALL remove the product from the customer's wishlist, keep the customer on the product page and show "Save to wishlist" again. While the request is in progress, the button SHALL be disabled and shown as busy.

#### Scenario: Right after saving
- Given a customer clicked "Save to wishlist" on the "Merge Conflict Jeans" product page, when the request finishes, then the page shows a "Remove from wishlist" button and no "Save to wishlist" button

#### Scenario: Later visit
- Given a customer has the "Merge Conflict Jeans" in their wishlist, when they open its product page, then the page shows a "Remove from wishlist" button

#### Scenario: Customer removes a product
- Given a customer has the "Merge Conflict Jeans" in their wishlist, when they click "Remove from wishlist" on its product page, then the product is no longer in their wishlist and the page shows "Save to wishlist"

### Requirement: Wishlist per customer
Each customer SHALL have their own wishlist: another customer's saved products SHALL NOT appear in it nor change the button shown to the current customer.

#### Scenario: Product saved by another customer
- Given another customer has the "Domain Event Tee" in their wishlist and the current customer does not, when the current customer opens its product page, then the page shows "Save to wishlist"

### Requirement: One entry per customer and product
A customer's wishlist SHALL hold a product at most once. Saving a product already in the wishlist SHALL leave a single entry, and removing a product not in the wishlist SHALL leave the wishlist unchanged; neither SHALL show an error.

#### Scenario: Saving twice
- Given a customer has the "Hexagonal Overshirt" in their wishlist, when they click "Save to wishlist" on a page opened before saving it, then the wishlist holds the "Hexagonal Overshirt" once and the page shows "Remove from wishlist"

#### Scenario: Removing twice
- Given a customer removed the "Hexagonal Overshirt" from their wishlist, when they click "Remove from wishlist" on a page opened before removing it, then the wishlist does not hold it and the page shows "Save to wishlist"

### Requirement: Saving a product no longer in the catalog
Saving a product that is no longer in the catalog SHALL be rejected with "This product is no longer available.", leaving the wishlist unchanged and the customer on the product page.

#### Scenario: Product removed after the page was opened
- Given a customer opened a product page and the product was then removed from the catalog, when they click "Save to wishlist", then the page shows "This product is no longer available." and the wishlist is unchanged

### Requirement: Wishlist page
The page /account/wishlist SHALL list the products in the current customer's wishlist, most recently saved first, each linking to its product page. With no saved products, it SHALL show "Your wishlist is empty." and a link to the catalog.

#### Scenario: Saved products
- Given a customer saved the "Domain Event Tee" and later the "Hexagonal Overshirt", when they open /account/wishlist, then it lists the "Hexagonal Overshirt" first and the "Domain Event Tee" second, each linking to its product page

#### Scenario: Empty wishlist
- Given a customer has no saved products, when they open /account/wishlist, then it shows "Your wishlist is empty." and a link to the catalog

#### Scenario: Products saved by other customers
- Given another customer has the "Merge Conflict Jeans" in their wishlist and the current customer does not, when the current customer opens /account/wishlist, then the "Merge Conflict Jeans" is not listed

### Requirement: Wishlist entry in the user menu
The user menu SHALL show a "Wishlist" link to /account/wishlist next to "My orders".

#### Scenario: Opening the user menu
- Given a customer opens the user menu, when the menu is shown, then it has a "Wishlist" link to /account/wishlist after the "My orders" link
