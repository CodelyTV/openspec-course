import { faker } from "@faker-js/faker";

import type { ProductVariantResponse } from "@/contexts/frontend/retail/api/responses";

import { SizeMother } from "./SizeMother";

const lowStockThreshold = 2;

export class ProductVariantResponseMother {
	static create(
		overrides: Partial<ProductVariantResponse> = {},
	): ProductVariantResponse {
		const onlineStock =
			overrides.onlineStock ?? faker.number.int({ min: 1, max: 20 });

		return {
			id: faker.string.uuid(),
			color: faker.color.human(),
			colorHex: faker.color.rgb(),
			size: SizeMother.create(),
			onlineStock,
			measurements: {
				chest: faker.number.int({ min: 90, max: 120 }),
				length: faker.number.int({ min: 60, max: 80 }),
			},
			hasStock: onlineStock > 0,
			isLowStock: onlineStock <= lowStockThreshold,
			...overrides,
		};
	}
}
