import type { ProductReviewResponse } from "@/contexts/frontend/retail/api/responses";

export type RatingBreakdownRow = {
	stars: number;
	count: number;
};

const starRatingsFromHighest = [5, 4, 3, 2, 1];

export function ratingBreakdown(
	reviews: Pick<ProductReviewResponse, "rating">[],
): RatingBreakdownRow[] {
	return starRatingsFromHighest.map((stars) => ({
		stars,
		count: reviews.filter((review) => review.rating === stars).length,
	}));
}
