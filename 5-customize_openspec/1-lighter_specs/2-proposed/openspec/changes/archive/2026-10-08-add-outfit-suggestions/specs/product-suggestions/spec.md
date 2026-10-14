# Spec Delta

## Purpose

Defines what the product page suggests to customers alongside the product they are viewing, and which source of suggestions takes precedence.

## ADDED Requirements

### Requirement: Product page shows the product's outfits
When the product belongs to at least one displayable outfit, the product page SHALL show every displayable outfit it belongs to instead of the collection suggestions. An outfit is displayable when it has at least 2 products. Outfits SHALL be ordered by name.

#### Scenario: Product in one outfit
- **WHEN** a customer opens a product that belongs to the "Weekend Refactor" outfit
- **THEN** the page shows the "Weekend Refactor" outfit and does not show the "You might also like" collection suggestions

#### Scenario: Product in several outfits
- **WHEN** a customer opens a product that belongs to the "Weekend Refactor" and "Deploy Friday" outfits
- **THEN** the page shows both outfits, "Deploy Friday" first

#### Scenario: Outfit below the minimum is hidden
- **WHEN** a customer opens a product whose only outfit has been left with 1 product
- **THEN** that outfit is not shown and the page shows the collection suggestions

### Requirement: Outfits are shown complete
Each outfit shown on the product page SHALL display its name and all of its products in the order the admin set, including the product being viewed, which SHALL be marked as the one currently viewed. Every other product SHALL link to its product page.

#### Scenario: Current product is marked
- **WHEN** a customer opens the "Hexagonal Overshirt" product, which belongs to an outfit with "Pure Function Tee"
- **THEN** the outfit shows both products, "Hexagonal Overshirt" marked as the product being viewed and "Pure Function Tee" linking to its product page

### Requirement: Out-of-stock pieces stay in the outfit
Products of an outfit SHALL be shown even when none of their variants has stock.

#### Scenario: Sold-out piece
- **WHEN** a customer opens a product whose outfit includes a product with no stock in any variant
- **THEN** the sold-out product is still shown in the outfit and links to its product page

### Requirement: Collection suggestions as fallback
When the product belongs to no displayable outfit, the product page SHALL keep showing the "You might also like" suggestions: up to 4 other products, those of the same collection first.

#### Scenario: Product in no outfit
- **WHEN** a customer opens a product that belongs to no outfit
- **THEN** the page shows "You might also like" with up to 4 other products, those of the same collection first

#### Scenario: Nothing to suggest
- **WHEN** a customer opens a product that belongs to no outfit and there are no other products in the catalog
- **THEN** the page shows no suggestions section
