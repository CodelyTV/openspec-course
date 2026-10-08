import { faker } from "@faker-js/faker";

import {
	type ProductVariantPrimitives,
	sizeOrder,
} from "@/contexts/backend/products/domain/ProductVariant";

export class ProductVariantMother {
	static createPrimitives(
		overrides: Partial<ProductVariantPrimitives> = {},
	): ProductVariantPrimitives {
		return {
			id: faker.string.uuid(),
			color: faker.color.human(),
			colorHex: faker.color.rgb(),
			size: faker.helpers.arrayElement(sizeOrder),
			onlineStock: faker.number.int({ min: 1, max: 20 }),
			measurements: {
				chest: faker.number.int({ min: 90, max: 120 }),
				length: faker.number.int({ min: 60, max: 80 }),
			},
			...overrides,
		};
	}
}
