# Spec Delta

## Purpose

Lets admins curate outfits — named looks made of a few catalog products — from the backoffice, and defines what makes an outfit valid.

## ADDED Requirements

### Requirement: Outfit composition
An outfit SHALL have a non-empty name and between 2 and 4 products, all distinct. An outfit references products, not variants: size and color are chosen by the customer on each product page. The order in which the admin lists the products SHALL be kept.

#### Scenario: Valid outfit
- **WHEN** an admin saves an outfit named "Weekend Refactor" with 3 different products
- **THEN** the outfit is saved with those 3 products in the order given

#### Scenario: Too few products
- **WHEN** an admin saves an outfit with only 1 product
- **THEN** the outfit is not saved and the admin sees an error saying an outfit needs between 2 and 4 products

#### Scenario: Too many products
- **WHEN** an admin saves an outfit with 5 products
- **THEN** the outfit is not saved and the admin sees an error saying an outfit needs between 2 and 4 products

#### Scenario: Repeated product
- **WHEN** an admin saves an outfit that lists the same product twice
- **THEN** the outfit is not saved and the admin sees an error saying a product can only appear once in an outfit

#### Scenario: Empty name
- **WHEN** an admin saves an outfit with an empty or blank name
- **THEN** the outfit is not saved and the admin sees an error saying the name is required

#### Scenario: Unknown product
- **WHEN** an admin saves an outfit that references a product that does not exist in the catalog
- **THEN** the outfit is not saved and the admin sees an error saying one of the products is no longer available

### Requirement: Unique outfit names
Two outfits SHALL NOT share the same name.

#### Scenario: Creating an outfit with a taken name
- **WHEN** an admin creates an outfit named "Deploy Friday" and another outfit already has that name
- **THEN** the outfit is not saved and the admin sees an error saying an outfit with that name already exists

#### Scenario: Keeping the name when editing
- **WHEN** an admin edits the "Deploy Friday" outfit, changes only its products and keeps its name
- **THEN** the outfit is saved

#### Scenario: Renaming to a taken name
- **WHEN** an admin renames an outfit to the name of another existing outfit
- **THEN** the outfit is not saved and the admin sees an error saying an outfit with that name already exists

### Requirement: List outfits
The backoffice SHALL have an Outfits section, reachable from the admin navigation, that lists every outfit with its name and number of products, ordered by name.

#### Scenario: Outfits exist
- **WHEN** an admin opens the Outfits section and there are outfits "Weekend Refactor" (4 products) and "Deploy Friday" (2 products)
- **THEN** both outfits are listed by name with their number of products, "Deploy Friday" first

#### Scenario: No outfits
- **WHEN** an admin opens the Outfits section and there are no outfits
- **THEN** the admin sees an empty state with a way to create the first outfit

### Requirement: Outfits with out-of-stock pieces are flagged
In the Outfits section, each outfit with at least one product that has no stock in any variant SHALL show a warning naming those products, in the outfit's order, so the admin can restock or replace them. Outfits whose products all have stock in some variant SHALL show no warning. The warning SHALL NOT change the list's order.

#### Scenario: Outfit with a sold-out piece
- **WHEN** "Pure Function Tee", one of the products of "Weekend Refactor", has no stock in any variant
- **THEN** "Weekend Refactor" shows a warning naming "Pure Function Tee"

#### Scenario: Several sold-out pieces
- **WHEN** two products of an outfit have no stock in any variant
- **THEN** the warning names both, in the order the admin set

#### Scenario: Piece with some variants sold out
- **WHEN** a product of an outfit has no stock in its M size but has stock in other variants
- **THEN** the outfit shows no warning

#### Scenario: Order is not changed by the warning
- **WHEN** "Deploy Friday" has no warning and "Weekend Refactor" has one
- **THEN** "Deploy Friday" is still listed first

### Requirement: Create outfit
Admins SHALL be able to create an outfit by giving it a name and choosing its products from the catalog.

#### Scenario: Successful creation
- **WHEN** an admin fills in a name, picks 2 to 4 different products and saves
- **THEN** the outfit is created and appears in the Outfits list

### Requirement: Edit outfit
Admins SHALL be able to change an existing outfit's name and products. The same validation as creation applies.

#### Scenario: Successful edit
- **WHEN** an admin opens an outfit, replaces one of its products and saves
- **THEN** the outfit keeps its name and has the new set of products

#### Scenario: Outfit no longer exists
- **WHEN** an admin saves an outfit that was deleted in the meantime
- **THEN** the admin sees an error saying the outfit no longer exists

### Requirement: Delete outfit
Admins SHALL be able to delete an outfit. Deleting an outfit SHALL NOT affect its products.

#### Scenario: Successful deletion
- **WHEN** an admin deletes the "Deploy Friday" outfit
- **THEN** the outfit no longer appears in the Outfits list and its products remain in the catalog

### Requirement: Removed catalog products leave outfits
When a product is removed from the catalog, it SHALL disappear from every outfit it belonged to; the outfit itself SHALL be kept so an admin can fix it.

#### Scenario: Outfit loses a product
- **WHEN** a product of a 3-product outfit is removed from the catalog
- **THEN** the outfit still exists with the 2 remaining products

#### Scenario: Outfit drops below the minimum
- **WHEN** a product of a 2-product outfit is removed from the catalog
- **THEN** the outfit still exists with 1 product, is listed in the Outfits section, and must be given at least 2 products before it can be saved again
