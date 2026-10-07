import { faker } from "@faker-js/faker";

import type {
	CheckoutLineResponse,
	CheckoutResponse,
} from "@/contexts/backend/checkout/application/view/CheckoutViewGetter";
import { sizeOrder } from "@/contexts/backend/products/domain/ProductVariant";
import { Money } from "@/contexts/shared/domain/Money";

import { MoneyMother } from "../../../shared/domain/MoneyMother";

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
			size: faker.helpers.arrayElement(sizeOrder),
			quantity,
			price,
			lineTotal: Money.fromPrimitives(price)
				.multiply(quantity)
				.toPrimitives(),
			...overrides,
		};
	}
}

export class CheckoutResponseMother {
	static create(overrides: Partial<CheckoutResponse> = {}): CheckoutResponse {
		const lines = overrides.lines ?? [CheckoutLineResponseMother.create()];

		return {
			status: "draft",
			subtotal:
				lines.length > 0
					? lines
							.map((line) => Money.fromPrimitives(line.lineTotal))
							.reduce((total, lineTotal) => total.add(lineTotal))
							.toPrimitives()
					: null,
			...overrides,
			lines,
		};
	}
}
