import { faker } from "@faker-js/faker";

import {
	RestockAlert,
	type RestockAlertPrimitives,
} from "@/contexts/backend/products/domain/RestockAlert";

const referenceDate = new Date("2026-10-01T12:00:00.000Z");

export class RestockAlertMother {
	static create(
		overrides: Partial<RestockAlertPrimitives> = {},
	): RestockAlert {
		return RestockAlert.fromPrimitives(
			RestockAlertMother.createPrimitives(overrides),
		);
	}

	static createPrimitives(
		overrides: Partial<RestockAlertPrimitives> = {},
	): RestockAlertPrimitives {
		return {
			userId: `user-${faker.string.alphanumeric(8)}`,
			variantId: faker.string.uuid(),
			requestedAt: faker.date
				.recent({ refDate: referenceDate })
				.toISOString(),
			...overrides,
		};
	}
}
