import { faker } from "@faker-js/faker";

import {
	Checkout,
	type CheckoutPrimitives,
} from "@/contexts/backend/checkout/domain/Checkout";

import { CheckoutLineMother } from "./CheckoutLineMother";

export class CheckoutMother {
	static create(overrides: Partial<CheckoutPrimitives> = {}): Checkout {
		return Checkout.fromPrimitives(
			CheckoutMother.createPrimitives(overrides),
		);
	}

	static createPrimitives(
		overrides: Partial<CheckoutPrimitives> = {},
	): CheckoutPrimitives {
		return {
			id: faker.string.uuid(),
			userId: `user-${faker.string.alphanumeric(8)}`,
			deliveryMethod: "home-delivery",
			status: "draft",
			version: faker.number.int({ min: 1, max: 10 }),
			lines: [CheckoutLineMother.createPrimitives()],
			...overrides,
		};
	}
}
