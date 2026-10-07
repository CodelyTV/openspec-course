import { faker } from "@faker-js/faker";

import type { LowStockResponse } from "@/contexts/backend/products/application/low-stock/LowStockLister";
import {
	lowStockThreshold,
	sizeOrder,
} from "@/contexts/backend/products/domain/ProductVariant";

export class LowStockResponseMother {
	static create(overrides: Partial<LowStockResponse> = {}): LowStockResponse {
		return {
			productName: faker.commerce.productName(),
			color: faker.color.human(),
			size: faker.helpers.arrayElement(sizeOrder),
			stock: faker.number.int({ min: 0, max: lowStockThreshold }),
			...overrides,
		};
	}
}
