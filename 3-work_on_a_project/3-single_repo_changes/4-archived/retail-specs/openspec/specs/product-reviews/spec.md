# product-reviews Specification

## Purpose

Lets customers who bought a product rate and review it, and shows the approved reviews on the product page so other customers can decide with the opinions of verified buyers.

## Requirements

### Requirement: Review content
A review SHALL have a rating, a title and a body. The rating SHALL be a whole number of stars from 1 to 5. The title SHALL be non-blank and at most 100 characters, and the body SHALL be non-blank and at most 2000 characters, both after trimming surrounding whitespace.

#### Scenario: Valid review
- **WHEN** a customer who bought "Hoodie Refactor" submits a review with 4 stars, the title "Warm and comfy" and a body
- **THEN** the review is saved for that product with those values

#### Scenario: Rating out of range
- **WHEN** a customer submits a review with 0 stars, 6 stars or a non-integer rating
- **THEN** the review is not saved and the customer sees an error saying the rating must be between 1 and 5 stars

#### Scenario: Blank title
- **WHEN** a customer submits a review with an empty or blank title
- **THEN** the review is not saved and the customer sees an error saying the title is required

#### Scenario: Blank body
- **WHEN** a customer submits a review with an empty or blank body
- **THEN** the review is not saved and the customer sees an error saying the review text is required

#### Scenario: Text too long
- **WHEN** a customer submits a review whose title is longer than 100 characters or whose body is longer than 2000 characters
- **THEN** the review is not saved and the customer sees an error naming the field and its limit

### Requirement: Only buyers can review
A customer SHALL be able to review a product only when that product appears in at least one of their orders, whatever the variant they bought.

#### Scenario: Customer bought the product
- **WHEN** a customer with an order that includes a variant of the product submits a valid review
- **THEN** the review is saved

#### Scenario: Customer did not buy the product
- **WHEN** a customer with no order that includes the product submits a review
- **THEN** the review is not saved and the customer gets an error saying only customers who bought the product can review it

### Requirement: One review per customer and product
A customer SHALL have at most one review per product, whatever its moderation status. A pending, approved or rejected review all count.

#### Scenario: Second review of the same product
- **WHEN** a customer who already reviewed a product submits another review of it
- **THEN** the new review is not saved and the customer sees an error saying they already reviewed this product

#### Scenario: Previous review was rejected
- **WHEN** a customer whose review of a product was rejected submits another review of it
- **THEN** the new review is not saved and the customer sees an error saying they already reviewed this product

#### Scenario: Same customer, different product
- **WHEN** a customer who reviewed one product submits a valid review of another product they bought
- **THEN** the review is saved

### Requirement: Reviews are final for their author
The author of a review SHALL NOT be able to edit or delete it.

#### Scenario: No edit or delete
- **WHEN** a customer views a product they already reviewed
- **THEN** no option to edit or delete their review is offered

### Requirement: New reviews start pending
Every newly submitted review SHALL start as pending moderation and SHALL NOT be visible to customers until staff approve it.

#### Scenario: Submitted review is pending
- **WHEN** a customer submits a valid review
- **THEN** the review is saved as pending and does not appear in the product page "Reviews" section

### Requirement: Product page shows approved reviews
The product page SHALL have a "Reviews" section listing every approved review of the product, newest first. Each review SHALL show its rating, title, body, the author's name and the date it was written. Pending and rejected reviews SHALL never be shown to customers.

#### Scenario: Approved reviews newest first
- **WHEN** a customer views a product with approved reviews written on 1 October and 5 October
- **THEN** the "Reviews" section shows the 5 October review first and the 1 October review second, each with its rating, title, body, author name and date

#### Scenario: Pending and rejected reviews hidden
- **WHEN** a customer views a product with 2 approved reviews, 1 pending review and 1 rejected review
- **THEN** the "Reviews" section shows only the 2 approved reviews

#### Scenario: No approved reviews
- **WHEN** a customer views a product with no approved reviews
- **THEN** the "Reviews" section says there are no reviews yet

### Requirement: Rating summary
The "Reviews" section SHALL show the number of approved reviews and their average rating, rounded to one decimal. Below the average it SHALL show a rating breakdown with one row per star rating, from 5 stars down to 1 star, always all five rows. Each row SHALL show its number of stars, how many approved reviews have that rating, and a bar proportional to that number's share of all approved reviews, without a percentage. Each row SHALL have an accessible label stating its stars and its number of reviews. Pending and rejected reviews SHALL NOT count.

#### Scenario: Average of approved reviews
- **WHEN** a product has approved reviews of 5, 4 and 4 stars and a pending review of 1 star
- **THEN** the section shows an average of 4.3 out of 5 from 3 reviews

#### Scenario: No average without approved reviews
- **WHEN** a product has no approved reviews
- **THEN** no average rating is shown

#### Scenario: Polarized ratings
- **WHEN** a product has approved reviews of 5, 5 and 1 stars
- **THEN** the breakdown shows, in this order, 5 stars with 2 reviews, 4 stars with 0 reviews, 3 stars with 0 reviews, 2 stars with 0 reviews and 1 star with 1 review

#### Scenario: Bars proportional to all approved reviews
- **WHEN** a product has 4 approved reviews, 3 of 5 stars and 1 of 2 stars
- **THEN** the 5-star bar fills three quarters of its length, the 2-star bar fills one quarter, the other bars are empty, and no percentage is shown

#### Scenario: Pending and rejected reviews excluded from the breakdown
- **WHEN** a product has approved reviews of 4 and 4 stars, a pending review of 1 star and a rejected review of 1 star
- **THEN** the breakdown shows 2 reviews for 4 stars and 0 reviews for 1 star

#### Scenario: Accessible row label
- **WHEN** a customer using a screen reader reaches the breakdown of a product with 7 approved 5-star reviews and 1 approved 1-star review
- **THEN** the 5-star row is announced as "5 stars: 7 reviews" and the 1-star row as "1 star: 1 review"

#### Scenario: No breakdown without approved reviews
- **WHEN** a product has no approved reviews
- **THEN** no rating breakdown is shown

#### Scenario: Rows are not interactive
- **WHEN** a customer selects a row of the breakdown
- **THEN** the list of reviews does not change

### Requirement: Review form for eligible customers
The product page SHALL show a review form (star rating, title and body) only to a customer who bought the product and has not reviewed it yet.

#### Scenario: Eligible customer
- **WHEN** a customer who bought the product and never reviewed it views the product page
- **THEN** the review form is shown

#### Scenario: Customer did not buy the product
- **WHEN** a customer who never bought the product views the product page
- **THEN** no review form and no review status message is shown

### Requirement: Review status instead of the form
After a customer submits a review, the product page SHALL show that their review is awaiting moderation instead of the form, for as long as it is pending. Once the review is moderated, the page SHALL show that they already reviewed the product, without saying whether it was approved or rejected.

#### Scenario: Just submitted
- **WHEN** a customer submits a valid review from the product page
- **THEN** the form is replaced by a message saying their review is awaiting moderation

#### Scenario: Review still pending
- **WHEN** a customer whose review of the product is pending views the product page
- **THEN** they see the awaiting-moderation message instead of the form

#### Scenario: Review already moderated
- **WHEN** a customer whose review of the product was approved or rejected views the product page
- **THEN** they see a message saying they already reviewed this product instead of the form
