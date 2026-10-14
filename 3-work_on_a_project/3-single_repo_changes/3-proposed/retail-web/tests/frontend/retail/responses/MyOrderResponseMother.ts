import { faker } from "@faker-js/faker";

import type { MyOrderResponse } from "@/contexts/frontend/retail/api/responses";

const referenceDate = new Date("2026-09-28T12:00:00.000Z");

export class MyOrderResponseMother {
	static create(overrides: Partial<MyOrderResponse> = {}): MyOrderResponse {
		return {
			id: faker.string.uuid(),
			createdAt: faker.date
				.recent({ refDate: referenceDate })
				.toISOString(),
			status: "confirmed",
			deliveryMethod: "home-delivery",
			subtotalAmount: faker.number.int({ min: 10, max: 500 }),
			currency: "EUR",
			items: faker.number.int({ min: 1, max: 5 }),
			...overrides,
		};
	}
}
