# Tasks

All paths are in `retail-web`.

## 1. Counting and labels

- [ ] 1.1 Add a pure function in `src/contexts/frontend/retail/ui/` that, given approved reviews, returns five `{ stars, count }` rows ordered 5 → 1, with 0 for ratings without reviews. Verify with unit tests in `tests/frontend/retail/ui/` covering polarized ratings (5, 5, 1 → 2, 0, 0, 0, 1), all five rows when only one rating is present, and an empty list.
- [ ] 1.2 Add a formatter to `src/contexts/frontend/retail/ui/format.ts` for a breakdown row label ("5 stars: 7 reviews", "1 star: 1 review"), reusing `formatReviewCount`. Verify with cases in `tests/frontend/retail/ui/format.spec.ts` for both singular and plural.

## 2. Breakdown in the "Reviews" section

- [ ] 2.1 Render the breakdown in `ProductReviews.tsx` between the summary line and `children`, only when there are approved reviews. Use a list labelled "Rating breakdown" with one row per star rating, each with `role="img"`, the row label from 1.2, and `aria-hidden` visuals (stars, bar, count). Each bar's width is `count / reviews.length`. Add the styles to `ProductReviews.module.scss`, with no percentage text. Verify with new cases in `tests/frontend/retail/sections/ProductReviews.spec.tsx`:
  - rows announced in order 5 → 1 with their counts, including 0-review rows ("4 stars: 0 reviews");
  - bar widths proportional to all reviews (3 of 4 → 75%, 1 of 4 → 25%, others 0%);
  - no "%" text;
  - no breakdown for `ProductReviewsResponseMother.empty()`.
- [ ] 2.2 Update the product detail entry in `docs/architecture/screens.md` to mention the per-star breakdown below the average. Verify that the doc matches the rendered section.

## 3. Integration check

- [ ] 3.1 Run `make checks` (lint, build, tests) and verify that it passes.
- [ ] 3.2 With `npm run dev` against a running `retail-api`, open a product with approved reviews and verify these spec scenarios: five rows in order 5 → 1, counts matching the listed reviews, and bars proportional. Then open a product with no approved reviews and verify that no breakdown appears.
