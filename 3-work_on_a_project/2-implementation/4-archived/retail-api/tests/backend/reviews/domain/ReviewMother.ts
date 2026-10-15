import { faker } from "@faker-js/faker";

import {
	Review,
	type ReviewPrimitives,
} from "@/contexts/backend/reviews/domain/Review";
import {
	maxReviewRating,
	minReviewRating,
} from "@/contexts/backend/reviews/domain/ReviewRating";
import { reviewStatuses } from "@/contexts/backend/reviews/domain/ReviewStatus";

const referenceDate = new Date("2026-10-01T12:00:00.000Z");

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
			authorId: `user-${faker.string.alphanumeric(8)}`,
			productName: faker.commerce.productName(),
			rating: faker.number.int({
				min: minReviewRating,
				max: maxReviewRating,
			}),
			title: faker.lorem.sentence({ min: 2, max: 6 }),
			body: faker.lorem.paragraph(),
			status: faker.helpers.arrayElement(reviewStatuses),
			createdAt: faker.date
				.recent({ refDate: referenceDate })
				.toISOString(),
			...overrides,
		};
	}
}
