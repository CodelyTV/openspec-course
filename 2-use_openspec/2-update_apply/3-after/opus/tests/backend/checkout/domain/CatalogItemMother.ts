import { faker } from "@faker-js/faker";

import {
	CatalogItem,
	type CatalogItemPrimitives,
} from "@/contexts/backend/checkout/domain/CatalogItem";

import { MoneyMother } from "../../../shared/domain/MoneyMother";

export class CatalogItemMother {
	static create(overrides: Partial<CatalogItemPrimitives> = {}): CatalogItem {
		return CatalogItem.fromPrimitives(
			CatalogItemMother.createPrimitives(overrides),
		);
	}

	static createPrimitives(
		overrides: Partial<CatalogItemPrimitives> = {},
	): CatalogItemPrimitives {
		return {
			productId: faker.helpers
				.slugify(faker.commerce.productName())
				.toLowerCase(),
			variantId: faker.string.uuid(),
			productName: faker.commerce.productName(),
			color: faker.color.human(),
			size: faker.helpers.arrayElement(["XS", "S", "M", "L", "XL"]),
			unitPrice: MoneyMother.createPrimitives(),
			unitsLeft: faker.number.int({ min: 1, max: 20 }),
			...overrides,
		};
	}
}
