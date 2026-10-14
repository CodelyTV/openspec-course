# Spec Delta

## MODIFIED Requirements

### Requirement: Initial variant selection
The product page SHALL open with the first variant that has stock selected, taking variants in size order (XS, S, M, L, XL) and, within a size, in color name order. When no variant has stock, the page SHALL open with the first variant in that order selected.

#### Scenario: Product with stock
- **WHEN** a customer opens the "Hexagonal Overshirt" product page
- **THEN** the color "Indigo" and the size "S" are selected and the selected variant reads "Indigo / S. Online stock: 4"

#### Scenario: Product with the first variants sold out
- **WHEN** a product has a size S variant with 0 units in stock and a size M variant with 4 units
- **THEN** the page opens with the size M variant selected

#### Scenario: Product with every variant sold out
- **WHEN** a customer with no restock alerts opens the "Merge Conflict Jeans" product page, whose variants all have 0 units in stock
- **THEN** the selected variant reads "Indigo / S. Online stock: 0" and the page shows a "Notify me when it's back" button and no "Add to cart" or "Sold out" button

### Requirement: Choosing a color
The product page SHALL show one swatch per color of the product, labelled with the color name, and a "Color: <selected color>" label. A color with no stock in any of its sizes SHALL be labelled "<color>, sold out" and SHALL remain selectable. When the customer picks a color, the page SHALL keep the selected size if that color has it in stock, and otherwise SHALL select the first size of that color with stock; when that color has no size with stock, the page SHALL select its first size.

#### Scenario: Same size in the new color
- **WHEN** a customer on the "Hexagonal Overshirt" product page with "Indigo / S" selected picks the "Moss" color
- **THEN** the selected variant reads "Moss / S. Online stock: 3"

#### Scenario: Size missing in the new color
- **WHEN** a customer on the "Domain Event Tee" product page with "White / S" selected picks the "Navy" color, which has no size S
- **THEN** the selected variant reads "Navy / M. Online stock: 8"

#### Scenario: Sold-out color
- **WHEN** a customer opens the "Merge Conflict Jeans" product page
- **THEN** the "Indigo, sold out" and "Black, sold out" swatches are enabled

#### Scenario: Picking a sold-out color
- **WHEN** a customer on the "Merge Conflict Jeans" product page with "Indigo / S" selected picks the "Black" color, which has only the size M, with 0 units in stock
- **THEN** the "Color: Black" label is shown and the selected variant reads "Black / M. Online stock: 0"

### Requirement: Choosing a size
The product page SHALL offer only the sizes of the selected color, ordered XS, S, M, L, XL. A size with no stock SHALL be labelled "Size <size>, sold out" and SHALL remain selectable.

#### Scenario: Sizes of the selected color
- **WHEN** a customer on the "Domain Event Tee" product page has the "Navy" color selected
- **THEN** the page offers the sizes M and L only

#### Scenario: Sold-out size
- **WHEN** a customer on the "Hexagonal Overshirt" product page has the "Moss" color selected
- **THEN** the page offers the sizes S, M and L, and "Size L, sold out" is enabled

#### Scenario: Picking a sold-out size
- **WHEN** a customer on the "Hexagonal Overshirt" product page with the "Moss" color selected picks the size "L"
- **THEN** the selected variant reads "Moss / L. Online stock: 0" and "Measurements: chest 116 cm, length 75 cm."

### Requirement: Add to cart button
The product page SHALL show an "Add to cart" button for a selected variant with stock; for a selected variant without stock it SHALL show the restock alert button defined by the `restock-alerts` capability instead. While the add is in progress, the button SHALL be disabled and shown as busy. A "Back to catalog" link to the catalog SHALL sit next to it. A product without variants SHALL show only a disabled "Sold out" button and the "Back to catalog" link, with no color, size or variant summary.

#### Scenario: Variant with stock
- **WHEN** a customer has "Indigo / S" of the "Hexagonal Overshirt" selected
- **THEN** the "Add to cart" button is enabled

#### Scenario: Variant without stock
- **WHEN** a customer has "Moss / L" of the "Hexagonal Overshirt" selected
- **THEN** the page shows no "Add to cart" or "Sold out" button, shows the restock alert button and keeps the "Back to catalog" link

#### Scenario: Add in progress
- **WHEN** a customer clicks "Add to cart" and the add has not finished
- **THEN** the button is disabled and shown as busy

#### Scenario: Product without variants
- **WHEN** a customer opens the page of a product that has no variants
- **THEN** the page shows a disabled "Sold out" button and a "Back to catalog" link, and no color or size options
