import { faker } from "@faker-js/faker";

import type { ReviewResponse } from "@/contexts/frontend/retail/api/responses";

const referenceDate = new Date("2026-09-28T12:00:00.000Z");

export class ReviewResponseMother {
	static create(overrides: Partial<ReviewResponse> = {}): ReviewResponse {
		return {
			id: faker.string.uuid(),
			authorName: faker.person.fullName(),
			rating: faker.number.int({ min: 1, max: 5 }),
			title: faker.lorem.words({ min: 1, max: 6 }),
			body: faker.lorem.sentences({ min: 1, max: 3 }),
			createdAt: faker.date
				.recent({ refDate: referenceDate })
				.toISOString(),
			...overrides,
		};
	}
}
