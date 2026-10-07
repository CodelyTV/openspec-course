# Spec Delta

## Purpose

Lets admins curate outfits from the backoffice: named, ordered combinations of catalog products that are later suggested to customers as complete looks.

## ADDED Requirements

### Requirement: Outfit composition rules
An outfit SHALL have a non-empty name and an ordered list of between 2 and 6 catalog products. A product SHALL appear at most once in an outfit, and every product SHALL exist in the catalog when the outfit is created or edited. An outfit that breaks any of these rules SHALL NOT be saved.

#### Scenario: Valid outfit is saved
- **WHEN** an admin saves an outfit named "Office look" with 3 distinct existing products
- **THEN** the outfit is saved with that name and those products in the given order

#### Scenario: Empty name is rejected
- **WHEN** an admin saves an outfit whose name is empty or only whitespace
- **THEN** the outfit is not saved and the admin sees an error explaining that the name is required

#### Scenario: Fewer than two products is rejected
- **WHEN** an admin saves an outfit with a single product
- **THEN** the outfit is not saved and the admin sees an error explaining that an outfit needs between 2 and 6 products

#### Scenario: More than six products is rejected
- **WHEN** a request tries to save an outfit with 7 products
- **THEN** the outfit is not saved and an error explaining that an outfit needs between 2 and 6 products is returned

#### Scenario: Repeated product is rejected
- **WHEN** an admin saves an outfit that picks the same product twice
- **THEN** the outfit is not saved and the admin sees an error explaining that a product can only appear once

#### Scenario: Unknown product is rejected
- **WHEN** an admin saves an outfit that includes a product id not present in the catalog
- **THEN** the outfit is not saved and the admin sees an error explaining that one of the products is no longer available

### Requirement: List outfits in the backoffice
The backoffice SHALL provide an "Outfits" panel, reachable from the admin navigation, that lists every outfit with its name and its number of pieces, and offers actions to create a new outfit and to edit or delete each listed one.

#### Scenario: Outfits are listed
- **WHEN** an admin opens the Outfits panel and two outfits exist
- **THEN** both outfits are listed with their names and number of pieces, each with edit and delete actions

#### Scenario: No outfits yet
- **WHEN** an admin opens the Outfits panel and no outfit exists
- **THEN** the panel shows an empty state and the action to create an outfit

### Requirement: Create an outfit
The backoffice SHALL let an admin create an outfit by entering a name and picking up to 6 products in order, one per piece slot. Empty slots SHALL be ignored, and the order of the filled slots SHALL be the order of the outfit's products.

#### Scenario: Outfit created from filled slots
- **WHEN** an admin enters "Office look", fills slots 1, 2 and 4 with three distinct products and leaves the rest empty
- **THEN** the outfit is created with those three products in slot order and the admin returns to the Outfits panel, where it is listed

#### Scenario: Creation fails a composition rule
- **WHEN** an admin submits the creation form with only one slot filled
- **THEN** no outfit is created and the form shows the error next to the entered values

### Requirement: Edit an outfit
The backoffice SHALL let an admin edit an existing outfit's name and products using the same form as creation, pre-filled with the outfit's current name and products in order. Saving SHALL apply the same composition rules as creation.

#### Scenario: Outfit edited
- **WHEN** an admin opens an outfit for editing, renames it and replaces one of its products
- **THEN** the outfit keeps its identity and is saved with the new name and products

#### Scenario: Editing an outfit that does not exist
- **WHEN** an admin opens the edit page of an outfit id that does not exist
- **THEN** the backoffice shows a not found page

### Requirement: Delete an outfit
The backoffice SHALL let an admin delete an outfit from the Outfits panel in a single action, without a browser confirmation dialog. A deleted outfit SHALL no longer be listed nor suggested to customers.

#### Scenario: Outfit deleted
- **WHEN** an admin deletes an outfit from the Outfits panel
- **THEN** the outfit disappears from the panel and from every product page

### Requirement: Backoffice access
Outfit management SHALL follow the same access rules as the rest of the backoffice: no roles or authentication are required.

#### Scenario: Any visitor can manage outfits
- **WHEN** any visitor opens the Outfits panel
- **THEN** the panel is shown and its actions are available, as with the other admin panels
