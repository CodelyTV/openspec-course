import { faker } from "@faker-js/faker";

import {
	Review,
	type ReviewPrimitives,
} from "@/contexts/backend/reviews/domain/Review";

const referenceDate = new Date("2026-09-28T12:00:00.000Z");

export class ReviewMother {
	static create(overrides: Partial<ReviewPrimitives> = {}): Review {
		return Review.fromPrimitives(ReviewMother.createPrimitives(overrides));
	}

	static pending(overrides: Partial<ReviewPrimitives> = {}): Review {
		return ReviewMother.create({ ...overrides, status: "pending" });
	}

	static approved(overrides: Partial<ReviewPrimitives> = {}): Review {
		return ReviewMother.create({ ...overrides, status: "approved" });
	}

	static rejected(overrides: Partial<ReviewPrimitives> = {}): Review {
		return ReviewMother.create({ ...overrides, status: "rejected" });
	}

	static createPrimitives(
		overrides: Partial<ReviewPrimitives> = {},
	): ReviewPrimitives {
		return {
			id: faker.string.uuid(),
			productId: faker.helpers
				.slugify(faker.commerce.productName())
				.toLowerCase(),
			userId: `user-${faker.string.alphanumeric(8)}`,
			productName: faker.commerce.productName(),
			authorName: faker.person.fullName(),
			rating: faker.number.int({ min: 1, max: 5 }),
			title: faker.lorem.words({ min: 1, max: 6 }),
			body: faker.lorem.sentences({ min: 1, max: 3 }),
			status: faker.helpers.arrayElement([
				"pending",
				"approved",
				"rejected",
			]),
			createdAt: faker.date
				.recent({ refDate: referenceDate })
				.toISOString(),
			...overrides,
		};
	}
}
