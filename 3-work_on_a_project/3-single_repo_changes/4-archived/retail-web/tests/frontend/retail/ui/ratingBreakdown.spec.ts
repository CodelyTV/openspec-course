import { describe, expect, it } from "vitest";

import type { ProductReviewResponse } from "@/contexts/frontend/retail/api/responses";
import { ratingBreakdown } from "@/contexts/frontend/retail/ui/ratingBreakdown";

import { ProductReviewResponseMother } from "../responses/ProductReviewResponseMother";

function reviewsRated(...ratings: number[]): ProductReviewResponse[] {
	return ratings.map((rating) =>
		ProductReviewResponseMother.create({ rating }),
	);
}

describe("ratingBreakdown should", () => {
	it("count the reviews of each star rating from 5 down to 1", () => {
		expect(ratingBreakdown(reviewsRated(5, 5, 1))).toEqual([
			{ stars: 5, count: 2 },
			{ stars: 4, count: 0 },
			{ stars: 3, count: 0 },
			{ stars: 2, count: 0 },
			{ stars: 1, count: 1 },
		]);
	});

	it("return all five star ratings when only one of them has reviews", () => {
		expect(ratingBreakdown(reviewsRated(3, 3))).toEqual([
			{ stars: 5, count: 0 },
			{ stars: 4, count: 0 },
			{ stars: 3, count: 2 },
			{ stars: 2, count: 0 },
			{ stars: 1, count: 0 },
		]);
	});

	it("return all five star ratings with no reviews when there are none", () => {
		expect(ratingBreakdown([])).toEqual([
			{ stars: 5, count: 0 },
			{ stars: 4, count: 0 },
			{ stars: 3, count: 0 },
			{ stars: 2, count: 0 },
			{ stars: 1, count: 0 },
		]);
	});
});
