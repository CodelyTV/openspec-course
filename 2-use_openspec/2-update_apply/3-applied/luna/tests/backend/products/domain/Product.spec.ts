import { describe, expect, it } from "vitest";

import { ProductMother } from "./ProductMother";

describe("Product.isOutOfStock", () => {
	it("is true when all variants are sold out", () => {
		const product = ProductMother.create({
			variants: [
				{
					id: "v1",
					color: "Black",
					colorHex: "#000000",
					size: "M",
					onlineStock: 0,
					measurements: { chest: 100, length: 70 },
				},
			],
		});
		expect(product.isOutOfStock()).toBe(true);
	});

	it("is false when some or no variants are sold out", () => {
		const common = {
			color: "Black",
			colorHex: "#000000",
			size: "M" as const,
			measurements: { chest: 100, length: 70 },
		};
		expect(
			ProductMother.create({
				variants: [
					{ ...common, id: "v1", onlineStock: 0 },
					{ ...common, id: "v2", onlineStock: 1 },
				],
			}).isOutOfStock(),
		).toBe(false);
		expect(
			ProductMother.create({
				variants: [{ ...common, id: "v1", onlineStock: 1 }],
			}).isOutOfStock(),
		).toBe(false);
	});
});
