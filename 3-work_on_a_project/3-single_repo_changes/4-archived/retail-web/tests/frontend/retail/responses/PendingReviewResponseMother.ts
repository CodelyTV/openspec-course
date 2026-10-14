import { faker } from "@faker-js/faker";

import type { PendingReviewResponse } from "@/contexts/frontend/retail/api/responses";

const referenceDate = new Date("2026-10-13T12:00:00.000Z");

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
			createdAt: faker.date
				.recent({ refDate: referenceDate })
				.toISOString(),
			...overrides,
		};
	}
}
