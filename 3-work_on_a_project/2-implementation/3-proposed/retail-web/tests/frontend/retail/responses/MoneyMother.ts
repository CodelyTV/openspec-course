import { faker } from "@faker-js/faker";

import type { MoneyPrimitives } from "@/contexts/frontend/retail/api/responses";

export class MoneyMother {
	static createPrimitives(
		overrides: Partial<MoneyPrimitives> = {},
	): MoneyPrimitives {
		return {
			amount: faker.number.int({ min: 10, max: 200 }),
			currency: "EUR",
			...overrides,
		};
	}
}
