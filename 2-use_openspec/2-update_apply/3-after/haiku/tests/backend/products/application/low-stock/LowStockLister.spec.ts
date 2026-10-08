import { describe, expect, it } from "vitest";

import { LowStockLister } from "@/contexts/backend/products/application/low-stock/LowStockLister";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("LowStockLister should", () => {
	const repository = Mock.create<ProductRepository>();
	const outfitRepository = Mock.create<OutfitRepository>();
	const lister = new LowStockLister(repository, outfitRepository);

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
		outfitRepository.countOutfitsByProductShouldReturn(new Map());

		expect(await lister.list()).toEqual({
			threshold: 2,
			variants: [
				{
					productName: "Alfa",
					color: "Black",
					size: "M",
					stock: 0,
					outfitCount: 0,
				},
				{
					productName: "Beta",
					color: "Red",
					size: "L",
					stock: 1,
					outfitCount: 0,
				},
				{
					productName: "Alfa",
					color: "Blue",
					size: "S",
					stock: 2,
					outfitCount: 0,
				},
			],
		});
	});

	it("tell how many outfits the product of each low stock variant belongs to: none, one or several", async () => {
		const inNoOutfit = ProductMother.create({
			id: "no-outfit",
			name: "Alfa",
			variants: [
				ProductVariantMother.createPrimitives({
					color: "Black",
					size: "M",
					onlineStock: 1,
				}),
			],
		});
		const inOneOutfit = ProductMother.create({
			id: "one-outfit",
			name: "Beta",
			variants: [
				ProductVariantMother.createPrimitives({
					color: "Red",
					size: "L",
					onlineStock: 1,
				}),
			],
		});
		const inSeveralOutfits = ProductMother.create({
			id: "several-outfits",
			name: "Gamma",
			variants: [
				ProductVariantMother.createPrimitives({
					color: "Green",
					size: "S",
					onlineStock: 2,
				}),
			],
		});
		repository.searchAllShouldReturn([
			inNoOutfit,
			inOneOutfit,
			inSeveralOutfits,
		]);
		outfitRepository.countOutfitsByProductShouldReturn(
			new Map([
				["one-outfit", 1],
				["several-outfits", 2],
			]),
		);

		const { variants } = await lister.list();

		expect(variants.map((variant) => variant.outfitCount)).toEqual([
			0, 1, 2,
		]);
	});

	it("keep the stock and name order when a variant belongs to an outfit", async () => {
		const inOutfit = ProductMother.create({
			id: "in-outfit",
			name: "Alfa",
			variants: [
				ProductVariantMother.createPrimitives({
					size: "M",
					onlineStock: 2,
				}),
			],
		});
		const notInOutfit = ProductMother.create({
			id: "not-in-outfit",
			name: "Beta",
			variants: [
				ProductVariantMother.createPrimitives({
					size: "M",
					onlineStock: 1,
				}),
			],
		});
		repository.searchAllShouldReturn([inOutfit, notInOutfit]);
		outfitRepository.countOutfitsByProductShouldReturn(
			new Map([["in-outfit", 2]]),
		);

		const { variants } = await lister.list();

		expect(
			variants.map(
				(variant) => `${variant.productName} ${variant.stock}`,
			),
		).toEqual(["Beta 1", "Alfa 2"]);
	});
});
