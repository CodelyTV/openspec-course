## ADDED Requirements

### Requirement: Inventory shows customers who wishlisted each product
The admin inventory SHALL show a "Wishlisted" column with, for each variant, the number of customers who have the variant's product in their wishlist, showing 0 when nobody saved it. Every variant of the same product SHALL show the same number. The column SHALL NOT change the inventory's order.

#### Scenario: Product saved by several customers
- Given two customers have the "Hexagonal Overshirt" in their wishlist, when an admin opens the inventory, then every "Hexagonal Overshirt" variant row shows 2 in the "Wishlisted" column

#### Scenario: Product nobody saved
- Given no customer has the "Domain Event Tee" in their wishlist, when an admin opens the inventory, then every "Domain Event Tee" variant row shows 0 in the "Wishlisted" column

#### Scenario: Order is not changed by the wishlisted count
- Given three customers have the "Hexagonal Overshirt" in their wishlist, nobody has the "Event Storm Knit", and "Event Storm Knit" Black / L and "Hexagonal Overshirt" Moss / L both have 0 units in stock, when an admin opens the inventory, then the "Event Storm Knit" Black / L row is listed before the "Hexagonal Overshirt" Moss / L row
