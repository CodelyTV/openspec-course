import { faker } from "@faker-js/faker";

import { lowStockThreshold } from "@/contexts/backend/products/domain/ProductVariant";
import type { DashboardResponse } from "@/contexts/frontend/retail/application/dashboard/DashboardGetter";

export class DashboardResponseMother {
	static create(
		overrides: Partial<DashboardResponse> = {},
	): DashboardResponse {
		return {
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
			ordersCount: faker.number.int({ min: 1, max: 50 }),
			lowStockThreshold,
			lowStockCount: 0,
			lowStock: [],
			recentOrders: [],
			...overrides,
		};
	}
}
