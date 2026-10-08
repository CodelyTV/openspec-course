import { faker } from "@faker-js/faker";

import type { OrdersSummaryResponse } from "@/contexts/backend/orders/application/summarize/OrdersSummaryGetter";

export class OrdersSummaryResponseMother {
	static create(
		overrides: Partial<OrdersSummaryResponse> = {},
	): OrdersSummaryResponse {
		return {
			ordersCount: faker.number.int({ min: 1, max: 50 }),
			revenuePerCurrency: [
				{
					amount: faker.number.int({ min: 100, max: 5000 }),
					currency: "EUR",
				},
			],
			averageOrderPerCurrency: [
				{
					amount: faker.number.int({ min: 10, max: 200 }),
					currency: "EUR",
				},
			],
			...overrides,
		};
	}
}
