import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { Review } from "../../domain/Review";
import type { ReviewRepository } from "../../domain/ReviewRepository";
import { type ReviewResponse, toReviewResponse } from "../ReviewResponse";

export type ProductReviewsResponse = {
	averageRating: number | null;
	reviewCount: number;
	reviews: ReviewResponse[];
};

function averageRatingRoundedToOneDecimal(reviews: Review[]): number | null {
	if (reviews.length === 0) {
		return null;
	}

	const totalStars = reviews.reduce(
		(total, review) => total + review.rating,
		0,
	);

	return Math.round((totalStars / reviews.length) * 10) / 10;
}

export class ProductReviewsFinder {
	constructor(private readonly repository: ReviewRepository) {}

	async find(productId: string): Promise<ProductReviewsResponse> {
		const approvedReviews = await this.repository.searchApprovedByProduct(
			new ProductId(productId),
		);

		return {
			averageRating: averageRatingRoundedToOneDecimal(approvedReviews),
			reviewCount: approvedReviews.length,
			reviews: approvedReviews.map(toReviewResponse),
		};
	}
}
