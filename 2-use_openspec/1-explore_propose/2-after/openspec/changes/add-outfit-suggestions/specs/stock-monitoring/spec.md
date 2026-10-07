# Spec Delta

## Purpose

Defines how admins follow stock in the backoffice — the low stock panel and the inventory — so they know what to restock first.

## ADDED Requirements

### Requirement: Low stock panel flags outfit products
In the low stock panel of the admin overview, each variant whose product belongs to at least one outfit SHALL show an "In outfit" tag. Variants whose product belongs to no outfit SHALL show no tag. The tag SHALL NOT change the panel's order (stock ascending, then product name).

#### Scenario: Low-stock variant of an outfit product
- **WHEN** the "Hexagonal Overshirt" product belongs to an outfit and its Green / M variant has low stock
- **THEN** the low stock panel shows the Green / M variant with the "In outfit" tag

#### Scenario: Low-stock variant of a product in no outfit
- **WHEN** a product belongs to no outfit and one of its variants has low stock
- **THEN** the low stock panel shows that variant without the "In outfit" tag

#### Scenario: Order is not changed by the tag
- **WHEN** a variant in no outfit has 1 unit and a variant of an outfit product has 2 units
- **THEN** the variant with 1 unit is listed first

### Requirement: Inventory flags outfit products
In the admin inventory, each variant whose product belongs to at least one outfit SHALL show an "In outfit" tag. The tag SHALL NOT change the inventory's order.

#### Scenario: Inventory row of an outfit product
- **WHEN** an admin opens the inventory and the "Pure Function Tee" product belongs to an outfit
- **THEN** every variant row of "Pure Function Tee" shows the "In outfit" tag

#### Scenario: Inventory row of a product in no outfit
- **WHEN** an admin opens the inventory and a product belongs to no outfit
- **THEN** its variant rows show no "In outfit" tag

### Requirement: Any outfit counts for the tag
A product SHALL count as being in an outfit for the tag whenever any outfit references it, including outfits left with fewer than 2 products.

#### Scenario: Outfit below the minimum
- **WHEN** a product is the only product left in an outfit
- **THEN** its variants show the "In outfit" tag in the low stock panel and the inventory
