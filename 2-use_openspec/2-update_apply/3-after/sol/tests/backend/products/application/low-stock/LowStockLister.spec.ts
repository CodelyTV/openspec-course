import { describe, expect, it } from "vitest";

import { LowStockLister } from "@/contexts/backend/products/application/low-stock/LowStockLister";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("LowStockLister should", () => {
	const repository = Mock.create<ProductRepository>();
	const outfits = Mock.create<OutfitRepository>();
	const lister = new LowStockLister(repository, outfits);

	it("return every variant at or below the threshold ordered by stock then name, along with the threshold", async () => {
		const alfa = ProductMother.create({
			name: "Alfa",
			variants: [
				ProductVariantMother.createPrimitives({
					id: "a0",
					color: "Black",
					size: "M",
					onlineStock: 0,
				}),
				ProductVariantMother.createPrimitives({
					id: "a2",
					color: "Blue",
					size: "S",
					onlineStock: 2,
				}),
			],
		});
		const beta = ProductMother.create({
			name: "Beta",
			variants: [
				ProductVariantMother.createPrimitives({
					id: "b1",
					color: "Red",
					size: "L",
					onlineStock: 1,
				}),
				ProductVariantMother.createPrimitives({
					id: "bHigh",
					color: "Green",
					size: "XL",
					onlineStock: 9,
				}),
			],
		});
		repository.searchAllShouldReturn([alfa, beta]);
		outfits.countOutfitsByProductShouldReturn(
			new Map([
				[alfa.id.value, 2],
				[beta.id.value, 1],
			]),
		);

		expect(await lister.list()).toEqual({
			threshold: 2,
			variants: [
				{
					productName: "Alfa",
					color: "Black",
					size: "M",
					stock: 0,
					outfitCount: 2,
				},
				{
					productName: "Beta",
					color: "Red",
					size: "L",
					stock: 1,
					outfitCount: 1,
				},
				{
					productName: "Alfa",
					color: "Blue",
					size: "S",
					stock: 2,
					outfitCount: 2,
				},
			],
		});
	});

	it("give products outside outfits a zero count without changing order", async () => {
		repository.searchAllShouldReturn([
			ProductMother.create({
				name: "Uncurated",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 0 }),
				],
			}),
			ProductMother.create({
				name: "Curated",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 1 }),
				],
			}),
		]);
		outfits.countOutfitsByProductShouldReturn(new Map());
		const report = await lister.list();
		expect(
			report.variants.map((row) => [row.productName, row.outfitCount]),
		).toEqual([
			["Uncurated", 0],
			["Curated", 0],
		]);
	});
});
