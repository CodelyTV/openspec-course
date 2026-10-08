import { describe, expect, it } from "vitest";

import { InventoryLister } from "@/contexts/backend/products/application/inventory/InventoryLister";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("InventoryLister should", () => {
	const repository = Mock.create<ProductRepository>();
	const outfitRepository = Mock.create<OutfitRepository>();
	const lister = new InventoryLister(repository, outfitRepository);

	it("list every variant of every product flagging and counting those at or below the low stock threshold", async () => {
		repository.searchAllShouldReturn([
			ProductMother.create({
				name: "Tee",
				collection: "Core",
				variants: [
					ProductVariantMother.createPrimitives({
						color: "Black",
						size: "M",
						onlineStock: 2,
					}),
					ProductVariantMother.createPrimitives({
						color: "White",
						size: "L",
						onlineStock: 3,
					}),
				],
			}),
		]);
		outfitRepository.countOutfitsByProductShouldReturn(new Map());

		expect(await lister.list()).toEqual({
			variants: [
				{
					productName: "Tee",
					collection: "Core",
					color: "Black",
					size: "M",
					stock: 2,
					low: true,
					inOutfit: false,
				},
				{
					productName: "Tee",
					collection: "Core",
					color: "White",
					size: "L",
					stock: 3,
					low: false,
					inOutfit: false,
				},
			],
			lowStockCount: 1,
		});
	});

	it("flag every variant of a product that belongs to at least one outfit, whatever the number of outfits", async () => {
		const inOneOutfit = ProductMother.create({
			id: "one-outfit",
			name: "Alfa",
			variants: [
				ProductVariantMother.createPrimitives({
					size: "S",
					onlineStock: 4,
				}),
				ProductVariantMother.createPrimitives({
					size: "M",
					onlineStock: 4,
				}),
			],
		});
		const inSeveralOutfits = ProductMother.create({
			id: "several-outfits",
			name: "Beta",
			variants: [
				ProductVariantMother.createPrimitives({
					size: "L",
					onlineStock: 4,
				}),
			],
		});
		const inNoOutfit = ProductMother.create({
			id: "no-outfit",
			name: "Gamma",
			variants: [
				ProductVariantMother.createPrimitives({
					size: "XL",
					onlineStock: 4,
				}),
			],
		});
		repository.searchAllShouldReturn([
			inOneOutfit,
			inSeveralOutfits,
			inNoOutfit,
		]);
		outfitRepository.countOutfitsByProductShouldReturn(
			new Map([
				["one-outfit", 1],
				["several-outfits", 2],
			]),
		);

		const { variants } = await lister.list();

		expect(
			variants.map(
				(variant) =>
					`${variant.productName} ${variant.size} ${variant.inOutfit}`,
			),
		).toEqual([
			"Alfa S true",
			"Alfa M true",
			"Beta L true",
			"Gamma XL false",
		]);
	});

	it("order the variants by stock, then product name, then size", async () => {
		repository.searchAllShouldReturn([
			ProductMother.create({
				name: "Beta",
				variants: [
					ProductVariantMother.createPrimitives({
						size: "S",
						onlineStock: 5,
					}),
					ProductVariantMother.createPrimitives({
						size: "M",
						onlineStock: 0,
					}),
				],
			}),
			ProductMother.create({
				name: "Alfa",
				variants: [
					ProductVariantMother.createPrimitives({
						size: "XL",
						onlineStock: 5,
					}),
					ProductVariantMother.createPrimitives({
						size: "XS",
						onlineStock: 5,
					}),
				],
			}),
		]);
		outfitRepository.countOutfitsByProductShouldReturn(new Map());

		const { variants } = await lister.list();

		expect(variants.map((row) => `${row.productName} ${row.size}`)).toEqual(
			["Beta M", "Alfa XS", "Alfa XL", "Beta S"],
		);
	});

	it("return no rows when the catalog is empty", async () => {
		repository.searchAllShouldReturn([]);
		outfitRepository.countOutfitsByProductShouldReturn(new Map());

		expect(await lister.list()).toEqual({ variants: [], lowStockCount: 0 });
	});
});
