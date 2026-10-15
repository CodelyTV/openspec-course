import { faker } from "@faker-js/faker";

import type {
	OrderDetailLineResponse,
	OrderDetailResponse,
} from "@/contexts/backend/orders/application/find/OrderFinder";
import { sizeOrder } from "@/contexts/backend/products/domain/ProductVariant";

const referenceDate = new Date("2026-09-28T12:00:00.000Z");

export class OrderDetailLineResponseMother {
	static create(
		overrides: Partial<OrderDetailLineResponse> = {},
	): OrderDetailLineResponse {
		return {
			productName: faker.commerce.productName(),
			color: faker.color.human(),
			size: faker.helpers.arrayElement(sizeOrder),
			quantity: faker.number.int({ min: 1, max: 3 }),
			unitPriceAmount: faker.number.int({ min: 10, max: 200 }),
			...overrides,
		};
	}
}

export class OrderDetailResponseMother {
	static create(
		overrides: Partial<OrderDetailResponse> = {},
	): OrderDetailResponse {
		const lines = overrides.lines ?? [
			OrderDetailLineResponseMother.create(),
		];

		return {
			id: faker.string.uuid(),
			userId: `user-${faker.string.alphanumeric(8)}`,
			customerName: faker.person.fullName(),
			createdAt: faker.date
				.recent({ refDate: referenceDate })
				.toISOString(),
			status: "confirmed",
			deliveryMethod: "home-delivery",
			subtotalAmount: lines.reduce(
				(total, line) => total + line.unitPriceAmount * line.quantity,
				0,
			),
			currency: "EUR",
			...overrides,
			lines,
		};
	}
}
