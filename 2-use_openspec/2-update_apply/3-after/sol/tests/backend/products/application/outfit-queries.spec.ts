import { describe, expect, it } from "vitest";

import { OutfitDeleter } from "@/contexts/backend/products/application/delete-outfit/OutfitDeleter";
import { OutfitFinder } from "@/contexts/backend/products/application/find-outfit/OutfitFinder";
import { OutfitsLister } from "@/contexts/backend/products/application/list-outfits/OutfitsLister";
import { OutfitNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitErrors";
import { OutfitId } from "@/contexts/backend/products/domain/OutfitId";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../shared/Mock";
import { OutfitMother } from "../domain/OutfitMother";
import { ProductMother } from "../domain/ProductMother";
import { ProductVariantMother } from "../domain/ProductVariantMother";

describe("outfit queries should", () => {
	it("find an outfit for editing and return null when absent", async () => {
		const outfits = Mock.create<OutfitRepository>();
		const finder = new OutfitFinder(outfits);
		const outfit = OutfitMother.create({
			id: "one",
			productIds: ["a", "b"],
		});
		outfits.searchShouldReturn(outfit);
		expect(await finder.find("one")).toEqual(outfit.toPrimitives());
		outfits.searchShouldReturn(null);
		expect(await finder.find("missing")).toBeNull();
	});

	it("delete an existing outfit and reject a missing one", async () => {
		const outfits = Mock.create<OutfitRepository>();
		const deleter = new OutfitDeleter(outfits);
		outfits.searchShouldReturn(OutfitMother.create({ id: "one" }));
		await deleter.delete("one");
		outfits.expectDeleteToHaveBeenCalledWith(new OutfitId("one"));
		outfits.searchShouldReturn(null);
		await expect(deleter.delete("missing")).rejects.toBeInstanceOf(
			OutfitNotFoundError,
		);
	});

	it("list by name with sold-out names in piece order", async () => {
		const outfits = Mock.create<OutfitRepository>();
		const products = Mock.create<ProductRepository>();
		const lister = new OutfitsLister(outfits, products);
		outfits.searchAllShouldReturn([
			OutfitMother.create({
				id: "z",
				name: "Zulu",
				productIds: ["sold-b", "partly", "sold-a"],
			}),
			OutfitMother.create({
				id: "m",
				name: "Middle",
				productIds: ["healthy", "sold-a"],
			}),
			OutfitMother.create({
				id: "a",
				name: "Alpha",
				productIds: ["healthy", "partly"],
			}),
		]);
		products.searchByIdsShouldReturn([
			ProductMother.create({
				id: "healthy",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 4 }),
				],
			}),
			ProductMother.create({
				id: "sold-a",
				name: "Sold A",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 0 }),
				],
			}),
			ProductMother.create({
				id: "sold-b",
				name: "Sold B",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 0 }),
				],
			}),
			ProductMother.create({
				id: "partly",
				variants: [
					ProductVariantMother.createPrimitives({ onlineStock: 0 }),
					ProductVariantMother.createPrimitives({ onlineStock: 2 }),
				],
			}),
		]);
		expect(await lister.list()).toEqual([
			{
				id: "a",
				name: "Alpha",
				productCount: 2,
				outOfStockProductNames: [],
			},
			{
				id: "m",
				name: "Middle",
				productCount: 2,
				outOfStockProductNames: ["Sold A"],
			},
			{
				id: "z",
				name: "Zulu",
				productCount: 3,
				outOfStockProductNames: ["Sold B", "Sold A"],
			},
		]);
	});
});
