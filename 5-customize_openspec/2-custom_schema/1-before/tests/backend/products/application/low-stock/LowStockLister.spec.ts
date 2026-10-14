import { beforeEach, describe, expect, it } from "vitest";

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

	beforeEach(() => {
		outfitRepository.countOutfitsByProductShouldReturn(new Map());
	});

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

	it("tell how many outfits the product of each low-stock variant belongs to without changing the order", async () => {
		repository.searchAllShouldReturn([
			ProductMother.create({
				id: "in-no-outfit",
				name: "Zeta",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 1 }),
				],
			}),
			ProductMother.create({
				id: "in-one-outfit",
				name: "Alfa",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 2 }),
				],
			}),
			ProductMother.create({
				id: "in-two-outfits",
				name: "Beta",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 2 }),
				],
			}),
		]);
		outfitRepository.countOutfitsByProductShouldReturn(
			new Map([
				["in-one-outfit", 1],
				["in-two-outfits", 2],
			]),
		);

		const { variants } = await lister.list();

		expect(
			variants.map((variant) => [
				variant.productName,
				variant.outfitCount,
			]),
		).toEqual([
			["Zeta", 0],
			["Alfa", 1],
			["Beta", 2],
		]);
	});
});
