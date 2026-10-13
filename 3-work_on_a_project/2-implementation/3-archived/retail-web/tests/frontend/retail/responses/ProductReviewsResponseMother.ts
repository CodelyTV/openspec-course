import type { ProductReviewsResponse } from "@/contexts/frontend/retail/api/responses";

import { ProductReviewResponseMother } from "./ProductReviewResponseMother";

function averageRatingOf(
	reviews: ProductReviewsResponse["reviews"],
): number | null {
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
			ProductReviewResponseMother.create(),
			ProductReviewResponseMother.create(),
		];

		return {
			averageRating: averageRatingOf(reviews),
			reviewCount: reviews.length,
			...overrides,
			reviews,
		};
	}

	static empty(): ProductReviewsResponse {
		return ProductReviewsResponseMother.create({ reviews: [] });
	}
}
