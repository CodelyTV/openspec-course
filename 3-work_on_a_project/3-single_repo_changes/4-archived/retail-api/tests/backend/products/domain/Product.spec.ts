import { describe, expect, it } from "vitest";

import type { Product } from "@/contexts/backend/products/domain/Product";

import { ProductMother } from "./ProductMother";
import { ProductVariantMother } from "./ProductVariantMother";

function productWithVariantStocks(...stocks: number[]): Product {
	return ProductMother.create({
		variants: stocks.map((onlineStock) =>
			ProductVariantMother.createPrimitives({ onlineStock }),
		),
	});
}

describe("Product should", () => {
	it.each([
		["every variant is sold out", [0, 0, 0], true],
		["only some variants are sold out", [0, 3, 0], false],
		["no variant is sold out", [2, 5, 1], false],
	])(
		"tell whether it is out of stock when %s",
		(_case, stocks, isOutOfStock) => {
			expect(productWithVariantStocks(...stocks).isOutOfStock()).toBe(
				isOutOfStock,
			);
		},
	);
});
