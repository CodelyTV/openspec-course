## ADDED Requirements

### Requirement: Inventory shows how wanted each product is
The admin inventory SHALL show a "Wishlisted" column with, for each variant, the number of customers who have the variant's product in their wishlist, showing 0 when nobody saved it. Every variant of the same product SHALL show the same number. The column SHALL NOT change the inventory's order.

#### Scenario: Product saved by several customers
- **WHEN** two customers saved "Hexagonal Overshirt" and an admin opens the inventory
- **THEN** every "Hexagonal Overshirt" variant row shows 2 in the "Wishlisted" column

#### Scenario: Product nobody saved
- **WHEN** no customer saved "Domain Event Tee" and an admin opens the inventory
- **THEN** every "Domain Event Tee" variant row shows 0 in the "Wishlisted" column

#### Scenario: Order is not changed by the wishlists
- **WHEN** three customers saved "Hexagonal Overshirt", nobody saved "Event Storm Knit", and the inventory lists "Event Storm Knit" Black / L before "Hexagonal Overshirt" Moss / L
- **THEN** the "Event Storm Knit" Black / L row is still listed before the "Hexagonal Overshirt" Moss / L row
