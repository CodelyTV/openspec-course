# Proposal

## Why

The product page summarizes reviews with only the average rating and the number of reviews. Two products can both average 3.0, one because every review gives it 3 stars and the other because half give it 5 and half give it 1. Customers can't tell whether opinions agree or are polarized, which is what they need to decide whether the reviews apply to them. A per-star breakdown, like Amazon's, answers that at a glance.

## What Changes

- The "Reviews" section of the product page (`/products/[id]`) shows a rating breakdown below the average rating: five rows, from 5 stars down to 1 star, always in that order and always all five, even when a row has 0 reviews.
- Each row shows the number of stars, a bar whose length is that row's share of all approved reviews, and the number of reviews with that rating. Percentages are not shown.
- Each row has an accessible label that can be read on its own, for example "5 stars: 7 reviews".
- Only approved reviews count. When a product has no approved reviews, no breakdown is shown, the same as the average today.
- The rows are not interactive. Selecting one does not filter the reviews.
- `retail-web` computes the breakdown from the approved reviews it already receives. `retail-api` and its response contract do not change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `product-reviews`: the "Rating summary" requirement adds a per-star breakdown of the approved reviews to the existing average rating and review count.

## Impact

- **retail-web**:
  - `src/contexts/frontend/retail/sections/ProductReviews.tsx` and its styles, which render the breakdown.
  - A new pure function that counts approved reviews per star rating, plus its unit tests.
  - `ProductReviews.spec.tsx`, which gets new cases for the breakdown.
  - `docs/architecture/screens.md`, which describes the product page "Reviews" section.
- **retail-api**: no changes. The breakdown relies on the existing guarantee that the reviews endpoint returns every approved review of the product. If that endpoint is ever paginated, the breakdown has to move to the API.
