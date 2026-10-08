import { faker } from "@faker-js/faker";

import type { PendingReviewResponse } from "@/contexts/frontend/retail/api/responses";

import { ReviewResponseMother } from "./ReviewResponseMother";

export class PendingReviewResponseMother {
	static create(
		overrides: Partial<PendingReviewResponse> = {},
	): PendingReviewResponse {
		return {
			...ReviewResponseMother.create(),
			productId: faker.helpers
				.slugify(faker.commerce.productName())
				.toLowerCase(),
			productName: faker.commerce.productName(),
			...overrides,
		};
	}
}
