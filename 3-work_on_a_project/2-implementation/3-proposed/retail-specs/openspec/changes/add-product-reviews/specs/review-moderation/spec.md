# Spec Delta

## Purpose

Lets staff decide from the backoffice which customer reviews go public, so only reviews that were checked appear on the product page.

## ADDED Requirements

### Requirement: Moderation queue
The backoffice SHALL have a "Reviews" section at `/admin/reviews`, reachable from a "Reviews" entry in the admin navigation, that lists every pending review, oldest first. Each entry SHALL show the product's name, the author's name, the date, the rating, the title and the body.

#### Scenario: Pending reviews oldest first
- **WHEN** staff open `/admin/reviews` with pending reviews written on 3 October and 1 October
- **THEN** the 1 October review is listed first and the 3 October review second, each with product name, author name, date, rating, title and body

#### Scenario: Only pending reviews are listed
- **WHEN** staff open `/admin/reviews` and there are pending, approved and rejected reviews
- **THEN** only the pending reviews are listed

#### Scenario: Empty queue
- **WHEN** staff open `/admin/reviews` and no review is pending
- **THEN** the section says there are no reviews awaiting moderation

#### Scenario: Navigation entry
- **WHEN** staff view any backoffice page
- **THEN** the admin navigation shows a "Reviews" entry linking to `/admin/reviews`, marked as current while they are in that section

### Requirement: Approve a review
Staff SHALL be able to approve a pending review. An approved review SHALL leave the queue and appear on its product page.

#### Scenario: Approve
- **WHEN** staff approve a pending review from the queue
- **THEN** the review is no longer listed in the queue, and it appears in its product page "Reviews" section and counts towards its rating summary

### Requirement: Reject a review
Staff SHALL be able to reject a pending review. A rejected review SHALL leave the queue and SHALL never be shown to customers.

#### Scenario: Reject
- **WHEN** staff reject a pending review from the queue
- **THEN** the review is no longer listed in the queue and does not appear on its product page nor count towards its rating summary

### Requirement: A review is moderated once
A review SHALL be approved or rejected only once. Approving or rejecting a review that is no longer pending SHALL fail without changing it.

#### Scenario: Already moderated in another tab
- **WHEN** staff approve or reject a review that was already approved or rejected (for example, from a stale page)
- **THEN** the review keeps its status and staff see an error saying the review was already moderated

#### Scenario: Unknown review
- **WHEN** staff approve or reject a review that does not exist
- **THEN** nothing changes and staff see an error saying the review was not found
