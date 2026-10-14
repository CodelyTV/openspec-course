# Spec Delta

## ADDED Requirements

### Requirement: Inventory shows customers waiting for each variant
The admin inventory SHALL show a "Waiting" column with, for each variant, the number of customers who have a restock alert for it, showing 0 when nobody is waiting. Every registered alert SHALL count, whatever the variant's current stock. The column SHALL NOT change the inventory's order.

#### Scenario: Variant with customers waiting
- **WHEN** two customers have a restock alert for "Hexagonal Overshirt" Moss / L and an admin opens the inventory
- **THEN** the "Hexagonal Overshirt" Moss / L row shows 2 in the "Waiting" column

#### Scenario: Variant nobody is waiting for
- **WHEN** no customer has a restock alert for "Domain Event Tee" White / S and an admin opens the inventory
- **THEN** the "Domain Event Tee" White / S row shows 0 in the "Waiting" column

#### Scenario: Order is not changed by the waiting customers
- **WHEN** three customers have a restock alert for "Hexagonal Overshirt" Moss / L, nobody has one for "Event Storm Knit" Black / L, and both variants have 0 units in stock
- **THEN** the "Event Storm Knit" Black / L row is listed before the "Hexagonal Overshirt" Moss / L row
