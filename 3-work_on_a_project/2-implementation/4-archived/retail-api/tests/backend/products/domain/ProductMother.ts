import { faker } from "@faker-js/faker";

import {
	Product,
	productAccents,
	type ProductPrimitives,
} from "@/contexts/backend/products/domain/Product";

import { MoneyMother } from "../../../shared/domain/MoneyMother";

import { ProductVariantMother } from "./ProductVariantMother";

export class ProductMother {
	static create(overrides: Partial<ProductPrimitives> = {}): Product {
		return Product.fromPrimitives(
			ProductMother.createPrimitives(overrides),
		);
	}

	static createPrimitives(
		overrides: Partial<ProductPrimitives> = {},
	): ProductPrimitives {
		return {
			id: faker.helpers
				.slugify(faker.commerce.productName())
				.toLowerCase(),
			name: faker.commerce.productName(),
			collection: faker.commerce.department(),
			category: faker.commerce.department(),
			description: faker.commerce.productDescription(),
			price: MoneyMother.createPrimitives(),
			badges: [],
			accent: faker.helpers.arrayElement(productAccents),
			variants: [ProductVariantMother.createPrimitives()],
			...overrides,
		};
	}
}
