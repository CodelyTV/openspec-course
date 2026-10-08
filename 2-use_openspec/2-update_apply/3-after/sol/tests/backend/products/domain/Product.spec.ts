import { expect, it } from "vitest";

import { ProductMother } from "./ProductMother";
import { ProductVariantMother } from "./ProductVariantMother";

it.each([
	{ stocks: [0, 0], expected: true },
	{ stocks: [0, 3], expected: false },
	{ stocks: [2, 3], expected: false },
])(
	"identifies whether all variants are sold out: $stocks",
	({ stocks, expected }) => {
		const product = ProductMother.create({
			variants: stocks.map((onlineStock) =>
				ProductVariantMother.createPrimitives({ onlineStock }),
			),
		});
		expect(product.isOutOfStock()).toBe(expected);
	},
);
