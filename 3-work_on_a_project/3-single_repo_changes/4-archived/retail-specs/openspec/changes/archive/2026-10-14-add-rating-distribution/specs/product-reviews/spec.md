# Spec Delta

## MODIFIED Requirements

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
