import { faker } from "@faker-js/faker";

import type { InventoryResponse } from "@/contexts/frontend/retail/api/responses";

import { SizeMother } from "./SizeMother";

export class InventoryResponseMother {
	static create(
		overrides: Partial<InventoryResponse> = {},
	): InventoryResponse {
		return {
			productName: faker.commerce.productName(),
			collection: faker.commerce.department(),
			color: faker.color.human(),
			size: SizeMother.create(),
			stock: faker.number.int({ min: 3, max: 20 }),
			low: false,
			inOutfit: false,
			...overrides,
		};
	}
}
