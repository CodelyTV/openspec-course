import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { Review } from "../../domain/Review";
import type { ReviewerDirectory } from "../../domain/ReviewerDirectory";
import type { ReviewRepository } from "../../domain/ReviewRepository";

export type ProductReviewResponse = {
	id: string;
	rating: number;
	title: string;
	body: string;
	authorName: string;
	createdAt: string;
};

export type ProductReviewsResponse = {
	averageRating: number | null;
	reviewCount: number;
	reviews: ProductReviewResponse[];
};

function averageRatingRoundedToOneDecimalOf(reviews: Review[]): number | null {
	if (reviews.length === 0) {
		return null;
	}

	const totalStars = reviews.reduce(
		(total, review) => total + review.rating.value,
		0,
	);

	return Math.round((totalStars / reviews.length) * 10) / 10;
}

export class ProductReviewsGetter {
	constructor(
		private readonly repository: ReviewRepository,
		private readonly reviewerDirectory: ReviewerDirectory,
	) {}

	async get(productId: string): Promise<ProductReviewsResponse> {
		const approvedReviews = await this.repository.searchApprovedByProduct(
			new ProductId(productId),
		);
		const reviewerNames = await this.reviewerDirectory.namesOf(
			approvedReviews.map((review) => review.authorId),
		);

		return {
			averageRating: averageRatingRoundedToOneDecimalOf(approvedReviews),
			reviewCount: approvedReviews.length,
			reviews: approvedReviews.map((review) => ({
				id: review.id.value,
				rating: review.rating.value,
				title: review.title,
				body: review.body,
				authorName: reviewerNames.nameOf(review.authorId),
				createdAt: review.createdAt.toISOString(),
			})),
		};
	}
}
