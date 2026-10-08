import type {
	ProductReviewsResponse,
	ReviewResponse,
} from "@/contexts/frontend/retail/api/responses";

import { ReviewResponseMother } from "./ReviewResponseMother";

function averageOf(reviews: ReviewResponse[]): number | null {
	if (reviews.length === 0) {
		return null;
	}

	const totalStars = reviews.reduce(
		(total, review) => total + review.rating,
		0,
	);

	return Math.round((totalStars / reviews.length) * 10) / 10;
}

export class ProductReviewsResponseMother {
	static create(
		overrides: Partial<ProductReviewsResponse> = {},
	): ProductReviewsResponse {
		const reviews = overrides.reviews ?? [
			ReviewResponseMother.create(),
			ReviewResponseMother.create(),
		];

		return {
			averageRating: averageOf(reviews),
			reviewCount: reviews.length,
			...overrides,
			reviews,
		};
	}

	static empty(): ProductReviewsResponse {
		return ProductReviewsResponseMother.create({ reviews: [] });
	}
}
