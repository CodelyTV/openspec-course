import { faker } from "@faker-js/faker";

import type { LowStockResponse } from "@/contexts/frontend/retail/api/responses";

import { SizeMother } from "./SizeMother";

const lowStockThreshold = 2;

export class LowStockResponseMother {
	static create(overrides: Partial<LowStockResponse> = {}): LowStockResponse {
		return {
			productName: faker.commerce.productName(),
			color: faker.color.human(),
			size: SizeMother.create(),
			stock: faker.number.int({ min: 0, max: lowStockThreshold }),
			outfitCount: 0,
			...overrides,
		};
	}
}
