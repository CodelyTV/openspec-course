# product-detail Specification

## Purpose

Defines the product page that customers open from the catalog: what it tells them about one product, how they choose a color and a size among its variants, and how they add the chosen variant to their cart. The suggestions shown below the product belong to the `product-suggestions` capability.

## Requirements

### Requirement: Product information
The product page SHALL show the product's collection, its name as the page heading, its description, every badge it has, and its price in whole units of its currency with no decimals (for example "€89"). The browser title SHALL be "<product name> · Codely Atelier" and the page description SHALL be the product description.

#### Scenario: Product with a badge
- **WHEN** a customer opens the "Event Storm Knit" product page
- **THEN** the page shows the "Architecture Drop" collection, the heading "Event Storm Knit", its description, the "Limited edition" badge and the price "€69"
- **AND** the browser title is "Event Storm Knit · Codely Atelier"

#### Scenario: Product without badges
- **WHEN** a customer opens the "Hexagonal Overshirt" product page
- **THEN** the page shows the price "€89" and no badges

### Requirement: Size guide and shipping information
The product page SHALL offer a collapsed "Size guide" with one row per size the product comes in, ordered XS, S, M, L, XL, showing the chest and length in centimetres; when several colors share a size, the row SHALL show the measurements of the first of them. The page SHALL also offer a collapsed "Shipping and returns" section stating "Home delivery in 2-4 business days." and "Free returns within 30 days if it's not for you."

#### Scenario: Size guide of a product in three sizes
- **WHEN** a customer opens the "Size guide" of the "Hexagonal Overshirt" product page
- **THEN** it lists S (chest 108 cm, length 71 cm), M (chest 112 cm, length 73 cm) and L (chest 116 cm, length 75 cm), in that order

#### Scenario: Shipping and returns
- **WHEN** a customer opens the "Shipping and returns" section of any product page
- **THEN** it reads "Home delivery in 2-4 business days." and "Free returns within 30 days if it's not for you."

### Requirement: Unknown product
Opening the product page of an id that matches no product, or of a blank id, SHALL show the not found page: "We couldn't find that page", "The product or page you are looking for does not exist." and a "Back to catalog" link to the catalog.

#### Scenario: Unknown id
- **WHEN** a customer opens the product page of "unknown-product"
- **THEN** the page shows "We couldn't find that page" with a "Back to catalog" link to the catalog

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

### Requirement: Selected variant summary
The product page SHALL show, under "Selected variant", the selected color and size with the exact units of online stock ("<color> / <size>. Online stock: <units>") and the variant's measurements ("Measurements: chest <chest> cm, length <length> cm.").

#### Scenario: Summary after picking a size
- **WHEN** a customer on the "Hexagonal Overshirt" product page picks the size "M" with the "Indigo" color selected
- **THEN** the page reads "Indigo / M. Online stock: 1" and "Measurements: chest 112 cm, length 73 cm."

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

### Requirement: Adding the selected variant to the cart
Clicking "Add to cart" SHALL add one unit of the selected variant to the customer's cart: a new line with 1 unit when the variant is not in the cart, or one more unit on its existing line. After the add, the customer SHALL be taken to the checkout, and the cart counter in the header SHALL show the new number of units in the cart.

#### Scenario: Variant not yet in the cart
- **WHEN** a customer whose cart is empty adds "White / S" of the "Domain Event Tee"
- **THEN** the cart holds 1 unit of "Domain Event Tee" White / S and the customer is taken to the checkout
- **AND** the header cart counter shows 1 item

#### Scenario: Variant already in the cart
- **WHEN** a customer whose cart holds 1 unit of "Hexagonal Overshirt" Moss / M, which has 2 units in stock, adds Moss / M again
- **THEN** the cart holds 2 units of that variant on a single line and the customer is taken to the checkout

### Requirement: Adding is limited by stock
The add SHALL be rejected when the units of the variant in the cart after the add would exceed its online stock, counting the units already in the cart. On rejection the cart SHALL stay unchanged, the customer SHALL stay on the product page and SHALL see "There isn't enough stock left for this item." under the button. The message SHALL disappear when the customer picks another color or size.

#### Scenario: Stock already in the cart
- **WHEN** a customer whose cart holds 2 units of "Hexagonal Overshirt" Moss / M, which has 2 units in stock, adds Moss / M again
- **THEN** the page shows "There isn't enough stock left for this item." and the cart still holds 2 units of that variant

#### Scenario: Message cleared by another selection
- **WHEN** the page shows "There isn't enough stock left for this item." and the customer picks another size
- **THEN** the message is no longer shown

### Requirement: Variant no longer in the catalog
Adding a variant that is no longer in the catalog SHALL be rejected with "The selected variant is no longer available.", leaving the cart unchanged and the customer on the product page.

#### Scenario: Variant removed after the page was opened
- **WHEN** a customer adds a variant that was removed from the catalog after the product page was opened
- **THEN** the page shows "The selected variant is no longer available." and the cart is unchanged
