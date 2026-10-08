import { describe, expect, it } from "vitest";

import { ProductFinder } from "@/contexts/backend/products/application/find/ProductFinder";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("ProductFinder should", () => {
	const repository = Mock.create<ProductRepository>();
	const finder = new ProductFinder(repository);

	it("expose the first variant with stock as the initial variant", async () => {
		const product = ProductMother.create({
			variants: [
				ProductVariantMother.createPrimitives({
					id: "sold-out",
					size: "S",
					onlineStock: 0,
				}),
				ProductVariantMother.createPrimitives({
					id: "available",
					size: "M",
					onlineStock: 4,
				}),
			],
		});
		repository.searchShouldReturn(product);

		const result = await finder.find(product.id.value);

		expect(result?.firstAvailableVariantId).toBe("available");
	});

	it("expose no initial variant when every variant is sold out", async () => {
		const product = ProductMother.create({
			variants: [
				ProductVariantMother.createPrimitives({ onlineStock: 0 }),
				ProductVariantMother.createPrimitives({ onlineStock: 0 }),
			],
		});
		repository.searchShouldReturn(product);

		const result = await finder.find(product.id.value);

		expect(result?.firstAvailableVariantId).toBeNull();
	});

	it("expose variants sorted by size and flag the ones with low or no stock", async () => {
		const product = ProductMother.create({
			variants: [
				ProductVariantMother.createPrimitives({
					id: "xl",
					size: "XL",
					onlineStock: 9,
				}),
				ProductVariantMother.createPrimitives({
					id: "s",
					size: "S",
					onlineStock: 0,
				}),
				ProductVariantMother.createPrimitives({
					id: "m",
					size: "M",
					onlineStock: 2,
				}),
			],
		});
		repository.searchShouldReturn(product);

		const result = await finder.find(product.id.value);

		expect(
			result?.variants.map(({ id, hasStock, isLowStock }) => ({
				id,
				hasStock,
				isLowStock,
			})),
		).toEqual([
			{ id: "s", hasStock: false, isLowStock: true },
			{ id: "m", hasStock: true, isLowStock: true },
			{ id: "xl", hasStock: true, isLowStock: false },
		]);
	});

	it("expose one size guide row per size in size order", async () => {
		const product = ProductMother.create({
			variants: [
				ProductVariantMother.createPrimitives({
					size: "L",
					color: "Black",
					measurements: { chest: 110, length: 72 },
				}),
				ProductVariantMother.createPrimitives({
					size: "S",
					color: "Black",
					measurements: { chest: 100, length: 68 },
				}),
				ProductVariantMother.createPrimitives({
					size: "S",
					color: "White",
					measurements: { chest: 100, length: 68 },
				}),
			],
		});
		repository.searchShouldReturn(product);

		const result = await finder.find(product.id.value);

		expect(result?.sizeGuide).toEqual([
			{ size: "S", chest: 100, length: 68 },
			{ size: "L", chest: 110, length: 72 },
		]);
	});

	it("return null when the product does not exist", async () => {
		repository.searchShouldReturn(null);

		expect(await finder.find("missing")).toBeNull();
	});

	it("return null for a blank id without looking it up", async () => {
		expect(await finder.find(" ")).toBeNull();
		repository.expectSearchNotToHaveBeenCalled();
	});
});
