# review-moderation Specification

## Purpose

Lets staff decide from the backoffice which customer reviews become public, by approving or rejecting each new review once.

## Requirements

### Requirement: Pending reviews queue
The backoffice SHALL have a Reviews section, reachable from the admin navigation, that lists every pending review, oldest first, with its product name, author name, date, rating, title and body. Approved and rejected reviews SHALL NOT be listed.

#### Scenario: Pending reviews exist
- **WHEN** staff open the Reviews section and there are pending reviews submitted yesterday and today
- **THEN** both are listed with their product name, author name, date, rating, title and body, yesterday's first

#### Scenario: Moderated reviews are not listed
- **WHEN** staff open the Reviews section and a review was already approved and another rejected
- **THEN** neither of them is listed

#### Scenario: Nothing to moderate
- **WHEN** staff open the Reviews section and there are no pending reviews
- **THEN** staff see an empty state saying there are no reviews to moderate

### Requirement: Approve a review
Staff SHALL be able to approve a pending review. An approved review SHALL leave the queue and SHALL be shown on its product page and counted in its average rating.

#### Scenario: Approving a review
- **WHEN** staff approve a pending 5-star review of "Pure Function Tee"
- **THEN** the review leaves the Reviews section and is shown on the "Pure Function Tee" product page, counted in its average rating

### Requirement: Reject a review
Staff SHALL be able to reject a pending review. A rejected review SHALL leave the queue, SHALL NOT be shown to customers and SHALL NOT count in the average rating. It SHALL still prevent its author from reviewing that product again.

#### Scenario: Rejecting a review
- **WHEN** staff reject a pending review of "Pure Function Tee"
- **THEN** the review leaves the Reviews section, is not shown on the "Pure Function Tee" product page and does not count in its average rating

### Requirement: A review is moderated once
Only pending reviews SHALL be approved or rejected. Approving or rejecting a review that was already moderated, or that does not exist, SHALL fail without changing any review.

#### Scenario: Review moderated in the meantime
- **WHEN** two staff members have the queue open and one approves a review that the other then tries to reject
- **THEN** the review stays approved and the second staff member is told the review was already moderated

#### Scenario: Review no longer exists
- **WHEN** staff approve or reject a review that does not exist
- **THEN** no review changes and staff are told the review no longer exists
