# Spec Delta

## Purpose

Shows customers, on a product page, the complete outfits curated by admins that the product belongs to, so they can discover how to combine it with other pieces.

## ADDED Requirements

### Requirement: Outfits shown on the product page
The product page SHALL show a section with every outfit that contains the viewed product. Each outfit SHALL show its name and its pieces in the outfit's order, each piece as a product card linking to its own product page. This section SHALL be separate from, and SHALL NOT replace, the "You might also like" section.

#### Scenario: Product belongs to one outfit
- **WHEN** a customer opens a product that belongs to the outfit "Office look" with 3 pieces
- **THEN** the page shows "Office look" with its 3 pieces in order, each linking to its product page

#### Scenario: Product belongs to several outfits
- **WHEN** a customer opens a product that belongs to two outfits
- **THEN** the page shows both outfits, each with all of its pieces

#### Scenario: Related products are still shown
- **WHEN** a customer opens a product that belongs to an outfit and has products in the same collection
- **THEN** the page shows both the outfits section and the "You might also like" section

### Requirement: Viewed product is marked inside the outfit
Within each outfit, the piece that is the product currently being viewed SHALL be shown in its position and visibly marked as the product the customer is viewing.

#### Scenario: Current piece is marked
- **WHEN** a customer opens a product that is the second piece of an outfit
- **THEN** the second piece of that outfit is marked as the product being viewed and the other pieces are not

### Requirement: Sold-out pieces stay visible
A piece whose product has no online stock left SHALL still be shown in the outfit, marked as sold out, and the outfit SHALL still be shown.

#### Scenario: One piece is sold out
- **WHEN** a customer opens a product whose outfit contains a piece with no online stock left
- **THEN** the outfit is shown with all its pieces and that piece is marked "Sold out"

### Requirement: Missing pieces are skipped
A piece whose product is no longer in the catalog SHALL NOT be shown; the rest of the outfit SHALL be shown in order.

#### Scenario: One piece no longer exists
- **WHEN** a customer opens a product whose outfit references a product that is no longer in the catalog
- **THEN** the outfit is shown with its remaining pieces in order and without an error

### Requirement: Section hidden without outfits
The outfits section SHALL NOT be shown when the viewed product belongs to no outfit.

#### Scenario: Product in no outfit
- **WHEN** a customer opens a product that belongs to no outfit
- **THEN** the page shows no outfits section
