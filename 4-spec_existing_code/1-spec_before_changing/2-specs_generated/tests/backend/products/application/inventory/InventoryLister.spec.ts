import { beforeEach, describe, expect, it } from "vitest";

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

	beforeEach(() => {
		outfitRepository.countOutfitsByProductShouldReturn(new Map());
	});

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

		const { variants } = await lister.list();

		expect(variants.map((row) => `${row.productName} ${row.size}`)).toEqual(
			["Beta M", "Alfa XS", "Alfa XL", "Beta S"],
		);
	});

	it("flag every variant of a product that belongs to one or several outfits without changing the order", async () => {
		repository.searchAllShouldReturn([
			ProductMother.create({
				id: "in-two-outfits",
				name: "Beta",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 1 }),
					ProductVariantMother.createPrimitives({ onlineStock: 9 }),
				],
			}),
			ProductMother.create({
				id: "in-one-outfit",
				name: "Alfa",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 5 }),
				],
			}),
			ProductMother.create({
				id: "in-no-outfit",
				name: "Gamma",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 3 }),
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
			variants.map((row) => [row.productName, row.stock, row.inOutfit]),
		).toEqual([
			["Beta", 1, true],
			["Gamma", 3, false],
			["Alfa", 5, true],
			["Beta", 9, true],
		]);
	});

	it("return no rows when the catalog is empty", async () => {
		repository.searchAllShouldReturn([]);

		expect(await lister.list()).toEqual({ variants: [], lowStockCount: 0 });
	});
});
