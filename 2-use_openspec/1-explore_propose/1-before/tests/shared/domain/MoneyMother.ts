import { faker } from "@faker-js/faker";

import { Money, type MoneyPrimitives } from "@/contexts/shared/domain/Money";

export class MoneyMother {
	static create(overrides: Partial<MoneyPrimitives> = {}): Money {
		return Money.fromPrimitives(MoneyMother.createPrimitives(overrides));
	}

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
