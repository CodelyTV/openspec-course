import { faker } from "@faker-js/faker";

import type { InventoryResponse } from "@/contexts/backend/products/application/inventory/InventoryLister";
import { sizeOrder } from "@/contexts/backend/products/domain/ProductVariant";

export class InventoryResponseMother {
	static create(
		overrides: Partial<InventoryResponse> = {},
	): InventoryResponse {
		return {
			productName: faker.commerce.productName(),
			collection: faker.commerce.department(),
			color: faker.color.human(),
			size: faker.helpers.arrayElement(sizeOrder),
			stock: faker.number.int({ min: 3, max: 20 }),
			low: false,
			inOutfit: false,
			waiting: faker.number.int({ min: 0, max: 5 }),
			...overrides,
		};
	}
}
