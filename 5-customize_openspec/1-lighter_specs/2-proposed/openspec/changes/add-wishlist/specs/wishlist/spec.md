# Spec Delta

## Purpose

Lets customers save the products they like to a personal wishlist from the product page, remove them, and review their saved products under My account.

## ADDED Requirements

### Requirement: Saving a product to the wishlist
The product page SHALL show a "Save to wishlist" button when the product is not in the current customer's wishlist; clicking it SHALL add the product to that wishlist and keep the customer on the product page.

#### Scenario: Customer saves a product
- Given a customer whose wishlist does not hold the "Hexagonal Overshirt", when they click "Save to wishlist" on its product page, then the product is in their wishlist and they stay on the product page.

### Requirement: Removing a product from the wishlist
The product page SHALL show a "Remove from wishlist" button when the product is in the current customer's wishlist, both right after saving it and on later visits; clicking it SHALL remove the product from that wishlist and keep the customer on the product page.

#### Scenario: Customer removes a saved product
- Given a customer whose wishlist holds the "Event Storm Knit", when they open its product page and click "Remove from wishlist", then the product is no longer in their wishlist and the page shows "Save to wishlist".

### Requirement: Wishlist holds products, not variants
The wishlist button SHALL refer to the whole product and SHALL NOT change when the customer picks another color or size, including sold-out ones.

#### Scenario: Picking another variant
- Given a customer whose wishlist holds the "Hexagonal Overshirt", when they pick "Moss / L" on its product page, then the page still shows "Remove from wishlist".

### Requirement: Wishlist button state while toggling
While a save or remove is in progress, the wishlist button SHALL be disabled and shown as busy.

#### Scenario: Toggle in progress
- Given a customer who clicked "Save to wishlist", when the request has not finished, then the button is disabled and shown as busy.

### Requirement: Wishlists are per customer
Each customer SHALL have their own wishlist: another customer's saved products SHALL NOT appear on the current customer's product page button or wishlist page.

#### Scenario: Product saved by another customer
- Given another customer has saved the "Domain Event Tee" and the current customer has not, when the current customer opens its product page, then the page shows "Save to wishlist".

### Requirement: Saving a product already in the wishlist
Saving a product that is already in the customer's wishlist SHALL keep a single entry and SHALL NOT show an error; removing a product that is not in the wishlist SHALL leave the wishlist unchanged and SHALL NOT show an error.

#### Scenario: Saving twice from two open pages
- Given a customer who saved the "Hexagonal Overshirt" from one tab, when they click "Save to wishlist" on a page opened before, then the wishlist holds the product once and the page shows "Remove from wishlist".

### Requirement: Saving a product no longer in the catalog
Saving a product that is no longer in the catalog SHALL be rejected with "This product is no longer available.", leaving the wishlist unchanged and the customer on the product page.

#### Scenario: Product removed after the page was opened
- Given a product removed from the catalog after its page was opened, when the customer clicks "Save to wishlist", then the page shows "This product is no longer available." and the wishlist is unchanged.

### Requirement: Wishlist page
The `/account/wishlist` page, titled "Wishlist", SHALL list the products in the current customer's wishlist, most recently saved first, each showing its name and linking to its product page.

#### Scenario: Customer with saved products
- Given a customer who saved the "Event Storm Knit" and then the "Hexagonal Overshirt", when they open "/account/wishlist", then "Hexagonal Overshirt" is listed before "Event Storm Knit" and each links to its product page.

### Requirement: Empty wishlist
When the current customer's wishlist is empty, the wishlist page SHALL show "Your wishlist is empty." and a "Browse the catalog" link to the catalog.

#### Scenario: Customer without saved products
- Given a customer with no saved products, when they open "/account/wishlist", then the page shows "Your wishlist is empty." and a "Browse the catalog" link.

### Requirement: Wishlist entry in the user menu
The user menu SHALL show a "Wishlist" link to `/account/wishlist` right after "My orders".

#### Scenario: Opening the user menu
- Given any customer, when they open the user menu, then it shows "My orders" followed by "Wishlist", which links to "/account/wishlist".

### Requirement: Products removed from the catalog leave the wishlist
A product removed from the catalog SHALL disappear from every wishlist.

#### Scenario: Saved product removed from the catalog
- Given a customer who saved a product that is later removed from the catalog, when they open "/account/wishlist", then that product is not listed.
