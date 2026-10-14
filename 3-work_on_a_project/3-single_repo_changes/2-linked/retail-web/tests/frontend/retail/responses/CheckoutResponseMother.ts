import { faker } from "@faker-js/faker";

import type {
	CheckoutLineResponse,
	CheckoutResponse,
	MoneyPrimitives,
} from "@/contexts/frontend/retail/api/responses";

import { MoneyMother } from "./MoneyMother";
import { SizeMother } from "./SizeMother";

export class CheckoutLineResponseMother {
	static create(
		overrides: Partial<CheckoutLineResponse> = {},
	): CheckoutLineResponse {
		const price = overrides.price ?? MoneyMother.createPrimitives();
		const quantity =
			overrides.quantity ?? faker.number.int({ min: 1, max: 3 });

		return {
			variantId: faker.string.uuid(),
			productName: faker.commerce.productName(),
			color: faker.color.human(),
			size: SizeMother.create(),
			quantity,
			price,
			lineTotal: { ...price, amount: price.amount * quantity },
			...overrides,
		};
	}
}

export class CheckoutResponseMother {
	static create(overrides: Partial<CheckoutResponse> = {}): CheckoutResponse {
		const lines = overrides.lines ?? [CheckoutLineResponseMother.create()];

		return {
			status: "draft",
			subtotal: subtotalOf(lines),
			...overrides,
			lines,
		};
	}
}

function subtotalOf(lines: CheckoutLineResponse[]): MoneyPrimitives | null {
	if (lines.length === 0) {
		return null;
	}

	return lines
		.map((line) => line.lineTotal)
		.reduce((total, lineTotal) => ({
			...total,
			amount: total.amount + lineTotal.amount,
		}));
}
