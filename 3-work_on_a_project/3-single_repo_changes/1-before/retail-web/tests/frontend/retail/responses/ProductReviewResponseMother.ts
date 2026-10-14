import { faker } from "@faker-js/faker";

import type { ProductReviewResponse } from "@/contexts/frontend/retail/api/responses";

const referenceDate = new Date("2026-10-13T12:00:00.000Z");

export class ProductReviewResponseMother {
	static create(
		overrides: Partial<ProductReviewResponse> = {},
	): ProductReviewResponse {
		return {
			id: faker.string.uuid(),
			rating: faker.number.int({ min: 1, max: 5 }),
			title: faker.lorem.sentence({ min: 2, max: 6 }),
			body: faker.lorem.paragraph(),
			authorName: faker.person.fullName(),
			createdAt: faker.date
				.recent({ refDate: referenceDate })
				.toISOString(),
			...overrides,
		};
	}
}
