import { describe, expect, it } from "vitest";

import { ProductSuggestionsFinder } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";

describe("ProductSuggestionsFinder", () => {
	it("returns a single outfit when the product belongs to one", async () => {
		const products = Mock.create<ProductRepository>();
		const outfits = Mock.create<OutfitRepository>();
		products.searchShouldReturn(ProductMother.create({ id: "current" }));
		outfits.searchContainingShouldReturn([
			OutfitMother.create({
				id: "single",
				name: "Only Look",
				productIds: ["current", "piece"],
			}),
		]);
		products.searchByIdsShouldReturn([
			ProductMother.create({ id: "current" }),
			ProductMother.create({ id: "piece" }),
		]);
		const result = await new ProductSuggestionsFinder(
			products,
			outfits,
		).find("current");
		expect(result.kind).toBe("outfits");
		if (result.kind === "outfits") {
			expect(result.outfits.map(({ name }) => name)).toEqual([
				"Only Look",
			]);
		}
	});

	it("returns all displayable outfits ordered by name, preserving piece order and sold-out pieces", async () => {
		const products = Mock.create<ProductRepository>();
		const outfits = Mock.create<OutfitRepository>();
		const finder = new ProductSuggestionsFinder(products, outfits);
		const current = ProductMother.create({ id: "current" });
		const outOfStock = ProductMother.create({
			id: "sold",
			name: "Sold",
			variants: [
				{
					id: "s1",
					color: "Black",
					colorHex: "#000",
					size: "M",
					onlineStock: 0,
					measurements: { chest: 100, length: 70 },
				},
			],
		});
		const last = ProductMother.create({ id: "last" });
		products.searchShouldReturn(current);
		outfits.searchContainingShouldReturn([
			OutfitMother.create({
				id: "weekend",
				name: "Weekend",
				productIds: ["current", "sold"],
			}),
			OutfitMother.create({
				id: "deploy",
				name: "Deploy",
				productIds: ["last", "current"],
			}),
			OutfitMother.create({
				id: "hidden",
				name: "Hidden",
				productIds: ["current"],
			}),
		]);
		products.searchByIdsShouldReturn([current, outOfStock, last]);
		const result = await finder.find("current");
		expect(result.kind).toBe("outfits");
		if (result.kind === "outfits") {
			expect(result.outfits.map(({ name }) => name)).toEqual([
				"Deploy",
				"Weekend",
			]);
			expect(result.outfits[1].products.map(({ id }) => id)).toEqual([
				"current",
				"sold",
			]);
			expect(result.outfits[1].products[1].totalOnlineStock).toBe(0);
		}
	});

	it("falls back to collection suggestions when no displayable outfit exists", async () => {
		const products = Mock.create<ProductRepository>();
		const outfits = Mock.create<OutfitRepository>();
		const finder = new ProductSuggestionsFinder(products, outfits);
		const current = ProductMother.create({ id: "current" });
		const related = ProductMother.create({ id: "related" });
		products.searchShouldReturn(current);
		outfits.searchContainingShouldReturn([
			OutfitMother.create({ id: "small", productIds: ["current"] }),
		]);
		products.searchOthersSameCollectionFirstShouldReturn([related]);
		const result = await finder.find("current");
		expect(result.kind).toBe("collection");
		if (result.kind === "collection") {
			expect(result.products.map(({ id }) => id)).toEqual(["related"]);
		}
		products.expectSearchOthersSameCollectionFirstToHaveBeenCalledWith(
			current,
			4,
		);
	});

	it("returns an empty collection when the product is missing", async () => {
		const products = Mock.create<ProductRepository>();
		const outfits = Mock.create<OutfitRepository>();
		products.searchShouldReturn(null);
		expect(
			await new ProductSuggestionsFinder(products, outfits).find("ghost"),
		).toEqual({ kind: "collection", products: [] });
		outfits.expectSearchContainingNotToHaveBeenCalled();
	});
});
