# Spec Delta

## ADDED Requirements

### Requirement: Inventory shows customers wishing for each product
The admin inventory SHALL show a "Wishlisted" column with, for each variant, the number of customers who have the variant's product in their wishlist, showing 0 when nobody has it. The column SHALL NOT change the inventory's order.

#### Scenario: Variant of a wishlisted product
- Given two customers have the "Hexagonal Overshirt" in their wishlist, when an admin opens the inventory, then every "Hexagonal Overshirt" variant row shows 2 in the "Wishlisted" column.

#### Scenario: Variant of a product nobody wishes for
- Given no customer has the "Domain Event Tee" in their wishlist, when an admin opens the inventory, then its variant rows show 0 in the "Wishlisted" column.

#### Scenario: Order is not changed by the wishlisted count
- Given three customers wish for the "Hexagonal Overshirt", nobody wishes for the "Event Storm Knit", and its Black / L and the Overshirt's Moss / L both have 0 units, when an admin opens the inventory, then "Event Storm Knit" Black / L is listed before "Hexagonal Overshirt" Moss / L.
