# Design

## Context

`GET /products/:id/reviews` returns `ProductReviewsResponse`: `averageRating` and `reviewCount`, both computed by `retail-api`, plus `reviews`, the full list of the product's approved reviews. The `product-reviews` spec guarantees the list is complete ("listing every approved review"). `ProductReviews.tsx` (`src/contexts/frontend/retail/sections/`) renders the summary line from the two aggregates and then the list. `retail-web` is otherwise a presentation layer with no aggregation of its own.

## Goals / Non-Goals

**Goals:**
- Render the per-star breakdown inside the existing `ProductReviews` section, between the summary line and the review form or status (`children`).
- Keep the counting in a pure, unit-tested function, separate from the component.

**Non-Goals:**
- Any change to `retail-api`, its HTTP contract, or `ProductReviewsResponse`.
- A reusable chart or bar component in the design system. The bar is a styled element local to the reviews section.

## Decisions

### Count in `retail-web` from `reviews`, not in the API
The breakdown is derived from `productReviews.reviews`. This is a small, deliberate exception to "aggregates come from the API", and it was chosen so the change ships without touching `retail-api`.
- *Alternative:* add a `ratingDistribution` to the API response. That is more consistent with `averageRating`, but it needs a cross-repo change and a contract update. It was rejected for this change. It becomes the right move if reviews are ever paginated (see Risks).

### A pure function returns all five rows in display order
A new module in `src/contexts/frontend/retail/ui/` (next to `format.ts`) takes the approved reviews and returns one row per rating, 5 down to 1. Each row has its `stars` and `count`, and ratings with no reviews get a `count` of 0. The component only maps over the rows, so "always five rows, 5 → 1" lives in one tested place rather than in JSX.
- *Alternative:* count inline in the component. That is harder to test without rendering, and it mixes the counting with the markup.

### Denominator is `reviews.length`, and the breakdown is shown when it is above 0
Each bar's width is `count / reviews.length` of the bar track, set as an inline width percentage. Both the bars and the counts come from the same array, so they always add up to the whole. The breakdown is shown when `reviews.length > 0`, for the same reason. The summary line keeps using `averageRating` and `reviewCount` from the API, as today.
- *Alternative:* use `reviewCount` as the denominator. That mixes two sources that should agree but could drift.

### Accessibility follows the `ReviewStars` pattern
The breakdown is a list labelled "Rating breakdown". Each row exposes one accessible name, for example "5 stars: 7 reviews" or "1 star: 1 review", via `role="img"` and `aria-label`. Its visual parts (star label, bar and number) are `aria-hidden`. This matches how `ReviewStars` already exposes "4 out of 5 stars". It also lets tests query each row by role and name, as the testing strategy asks. The label text comes from a new formatter in `format.ts` that reuses `formatReviewCount` for the "review/reviews" plural and adds "star/stars".
- *Alternative:* plain visible text with no explicit label. In that case the bar contributes nothing to a screen reader, and the row reads as fragments.

### Rows are static elements
No buttons or links, so selecting a row does nothing (spec scenario "Rows are not interactive").

## Risks / Trade-offs

- [Reviews endpoint becomes paginated, so `reviews` is no longer every approved review and the breakdown silently undercounts] → The dependency is recorded here and in the proposal's Impact section. Any change that paginates the endpoint MUST move the breakdown to the API as `ratingDistribution`.
- [`retail-web` now holds a small piece of aggregation logic, which goes against its "no business logic" convention] → It is limited to one pure function with unit tests, so it is easy to replace with an API field later.
- [Many approved reviews means counting a long array on every render] → This is negligible at the expected volumes, and the page already renders every review.
