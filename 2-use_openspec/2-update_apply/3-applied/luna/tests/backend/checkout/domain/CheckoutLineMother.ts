import { faker } from "@faker-js/faker";

import type { CheckoutLinePrimitives } from "@/contexts/backend/checkout/domain/CheckoutLine";

export class CheckoutLineMother {
	static createPrimitives(
		overrides: Partial<CheckoutLinePrimitives> = {},
	): CheckoutLinePrimitives {
		return {
			productId: faker.helpers
				.slugify(faker.commerce.productName())
				.toLowerCase(),
			variantId: faker.string.uuid(),
			quantity: faker.number.int({ min: 1, max: 3 }),
			...overrides,
		};
	}
}
