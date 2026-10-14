import { faker } from "@faker-js/faker";

import type { PendingReviewResponse } from "@/contexts/backend/reviews/application/list-pending/PendingReviewsLister";

export class PendingReviewResponseMother {
	static create(
		overrides: Partial<PendingReviewResponse> = {},
	): PendingReviewResponse {
		return {
			id: faker.string.uuid(),
			productId: faker.helpers
				.slugify(faker.commerce.productName())
				.toLowerCase(),
			productName: faker.commerce.productName(),
			authorName: faker.person.fullName(),
			rating: faker.number.int({ min: 1, max: 5 }),
			title: faker.lorem.sentence({ min: 2, max: 6 }),
			body: faker.lorem.paragraph(),
			createdAt: faker.date.recent().toISOString(),
			...overrides,
		};
	}
}
