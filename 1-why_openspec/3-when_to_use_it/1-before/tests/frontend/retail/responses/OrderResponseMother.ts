import { faker } from "@faker-js/faker";

import type { OrderResponse } from "@/contexts/backend/orders/application/list/OrdersLister";

const referenceDate = new Date("2026-09-28T12:00:00.000Z");

export class OrderResponseMother {
	static create(overrides: Partial<OrderResponse> = {}): OrderResponse {
		return {
			id: faker.string.uuid(),
			createdAt: faker.date
				.recent({ refDate: referenceDate })
				.toISOString(),
			status: "confirmed",
			customerName: faker.person.fullName(),
			subtotalAmount: faker.number.int({ min: 10, max: 500 }),
			currency: "EUR",
			items: faker.number.int({ min: 1, max: 5 }),
			...overrides,
		};
	}
}
