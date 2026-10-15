import { faker } from "@faker-js/faker";

import type {
	ProductReviewResponse,
	ProductReviewsResponse,
} from "@/contexts/backend/reviews/application/get-product-reviews/ProductReviewsGetter";

export class ProductReviewsResponseMother {
	static create(
		overrides: Partial<ProductReviewsResponse> = {},
	): ProductReviewsResponse {
		const reviews = overrides.reviews ?? [
			ProductReviewsResponseMother.review(),
		];

		return {
			averageRating: reviews.length > 0 ? reviews[0].rating : null,
			reviewCount: reviews.length,
			...overrides,
			reviews,
		};
	}

	static review(
		overrides: Partial<ProductReviewResponse> = {},
	): ProductReviewResponse {
		return {
			id: faker.string.uuid(),
			rating: faker.number.int({ min: 1, max: 5 }),
			title: faker.lorem.sentence({ min: 2, max: 6 }),
			body: faker.lorem.paragraph(),
			authorName: faker.person.fullName(),
			createdAt: faker.date.recent().toISOString(),
			...overrides,
		};
	}
}
