# Spec Delta

## Purpose

Lets customers who bought a product review it with a star rating, a title and a body, and shows the approved reviews and the average rating on the product page.

## ADDED Requirements

### Requirement: Only buyers can review a product
A customer SHALL be able to review a product only when that product appears in at least one of their orders. The variant, quantity and date of the order SHALL NOT matter.

#### Scenario: Customer who bought the product
- **WHEN** a customer who has an order containing "Pure Function Tee" submits a valid review for it
- **THEN** the review is saved as pending

#### Scenario: Customer who did not buy the product
- **WHEN** a customer with no order containing "Pure Function Tee" submits a review for it
- **THEN** the review is not saved and the customer is told only customers who bought the product can review it

### Requirement: One review per customer and product
A customer SHALL have at most one review per product, whatever its moderation status. A customer SHALL NOT be able to edit or delete their review.

#### Scenario: Second review of the same product
- **WHEN** a customer who already reviewed "Pure Function Tee" submits another review for it
- **THEN** the review is not saved and the customer is told they already reviewed this product

#### Scenario: Previous review was rejected
- **WHEN** a customer whose review of "Pure Function Tee" was rejected submits another review for it
- **THEN** the review is not saved and the customer is told they already reviewed this product

#### Scenario: Same customer, different products
- **WHEN** a customer who reviewed "Pure Function Tee" and also bought "Hexagonal Overshirt" submits a review for "Hexagonal Overshirt"
- **THEN** the review is saved as pending

### Requirement: Review content
A review SHALL have a rating that is a whole number of stars from 1 to 5, a title of 1 to 100 characters and a body of 1 to 2000 characters. Title and body SHALL be trimmed before they are checked and saved.

#### Scenario: Valid review
- **WHEN** a customer submits a review with 4 stars, the title "Fits great" and a body
- **THEN** the review is saved with that rating, title and body

#### Scenario: Rating out of range
- **WHEN** a customer submits a review with 0 or 6 stars, or a non-whole number of stars
- **THEN** the review is not saved and the customer is told the rating must be between 1 and 5 stars

#### Scenario: Blank title
- **WHEN** a customer submits a review whose title is empty or only spaces
- **THEN** the review is not saved and the customer is told the title must have between 1 and 100 characters

#### Scenario: Title too long
- **WHEN** a customer submits a review whose title has 101 characters
- **THEN** the review is not saved and the customer is told the title must have between 1 and 100 characters

#### Scenario: Blank or too long body
- **WHEN** a customer submits a review whose body is empty, only spaces, or longer than 2000 characters
- **THEN** the review is not saved and the customer is told the review must have between 1 and 2000 characters

### Requirement: New reviews await moderation
Every new review SHALL start as pending and SHALL NOT be shown to customers until staff approve it.

#### Scenario: Review just submitted
- **WHEN** a customer submits a valid review for a product
- **THEN** the review is pending and the product page does not show it yet

### Requirement: Review form on the product page
The product page SHALL show a review form (star rating, title, body) only to a customer who bought the product and has not reviewed it. A customer who already reviewed it SHALL see that their review exists instead of the form, and a customer who did not buy it SHALL see neither.

#### Scenario: Buyer without a review
- **WHEN** a customer who bought "Pure Function Tee" and has not reviewed it opens its product page
- **THEN** the page shows the review form

#### Scenario: Review submitted from the form
- **WHEN** the customer fills in the form with valid values and submits it
- **THEN** the form is replaced by a message saying their review is awaiting moderation

#### Scenario: Invalid review in the form
- **WHEN** the customer submits the form with a blank title
- **THEN** the form stays with the values entered and shows the error message

#### Scenario: Buyer whose review is pending
- **WHEN** a customer whose review of the product is pending opens its product page
- **THEN** the page shows that their review is awaiting moderation and no form

#### Scenario: Buyer whose review was moderated
- **WHEN** a customer whose review of the product was approved or rejected opens its product page
- **THEN** the page shows that they already reviewed this product and no form

#### Scenario: Customer who did not buy the product
- **WHEN** a customer who did not buy the product opens its product page
- **THEN** the page shows no review form and no review status

### Requirement: Approved reviews on the product page
The product page SHALL show every approved review of the product, newest first, each with its rating, title, body, author name and date. Pending and rejected reviews SHALL NOT be shown.

#### Scenario: Product with approved reviews
- **WHEN** a customer opens a product with an approved review from 2 days ago and another from yesterday
- **THEN** both reviews are shown with their rating, title, body, author name and date, yesterday's first

#### Scenario: Pending and rejected reviews are hidden
- **WHEN** a product has one approved, one pending and one rejected review
- **THEN** the product page shows only the approved review

#### Scenario: Product without approved reviews
- **WHEN** a customer opens a product with no approved reviews
- **THEN** the reviews section says there are no reviews yet

### Requirement: Average rating
The product page SHALL show the average rating of the product's approved reviews, rounded to one decimal, and the number of approved reviews. Pending and rejected reviews SHALL NOT count.

#### Scenario: Average of approved reviews
- **WHEN** a product has approved reviews of 5, 4 and 4 stars and a pending review of 1 star
- **THEN** the product page shows an average rating of 4.3 out of 5 from 3 reviews

#### Scenario: No approved reviews
- **WHEN** a product has only pending or rejected reviews
- **THEN** the product page shows no average rating and says there are no reviews yet
