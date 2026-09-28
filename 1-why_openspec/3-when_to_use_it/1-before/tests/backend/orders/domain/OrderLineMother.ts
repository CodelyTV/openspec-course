import { faker } from "@faker-js/faker";

import type { OrderLinePrimitives } from "@/contexts/backend/orders/domain/OrderLine";

import { MoneyMother } from "../../../shared/domain/MoneyMother";

export class OrderLineMother {
	static createPrimitives(
		overrides: Partial<OrderLinePrimitives> = {},
	): OrderLinePrimitives {
		return {
			productId: faker.helpers
				.slugify(faker.commerce.productName())
				.toLowerCase(),
			variantId: faker.string.uuid(),
			quantity: faker.number.int({ min: 1, max: 3 }),
			unitPrice: MoneyMother.createPrimitives(),
			...overrides,
		};
	}
}
