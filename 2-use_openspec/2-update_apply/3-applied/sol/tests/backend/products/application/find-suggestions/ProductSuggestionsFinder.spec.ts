import { beforeEach, describe, expect, it } from "vitest";

import { ProductSuggestionsFinder } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("ProductSuggestionsFinder should", () => {
	const products = Mock.create<ProductRepository>();
	const outfits = Mock.create<OutfitRepository>();
	const finder = new ProductSuggestionsFinder(products, outfits);
	const viewed = ProductMother.create({ id: "viewed" });
	beforeEach(() => {
		products.searchShouldReturn(viewed);
		products.searchByIdsShouldReturn([
			viewed,
			ProductMother.create({ id: "other" }),
		]);
		products.searchOthersSameCollectionFirstShouldReturn([
			ProductMother.create({ id: "related" }),
		]);
		outfits.searchContainingShouldReturn([]);
	});

	it("show one complete outfit in the saved product order", async () => {
		outfits.searchContainingShouldReturn([
			OutfitMother.create({
				name: "Look",
				productIds: ["other", "viewed"],
			}),
		]);
		const result = await finder.find("viewed");
		expect(result.kind).toBe("outfits");
		if (result.kind === "outfits") {
			expect(
				result.outfits[0].products.map((product) => product.id),
			).toEqual(["other", "viewed"]);
		}
	});

	it("show several outfits ordered by name", async () => {
		outfits.searchContainingShouldReturn([
			OutfitMother.create({
				name: "Zulu",
				productIds: ["viewed", "other"],
			}),
			OutfitMother.create({
				name: "Alpha",
				productIds: ["other", "viewed"],
			}),
		]);
		const result = await finder.find("viewed");
		expect(
			result.kind === "outfits" &&
				result.outfits.map((outfit) => outfit.name),
		).toEqual(["Alpha", "Zulu"]);
	});

	it("keep a sold-out piece in the outfit", async () => {
		const soldOut = ProductMother.create({
			id: "other",
			variants: [
				ProductVariantMother.createPrimitives({ onlineStock: 0 }),
			],
		});
		products.searchByIdsShouldReturn([viewed, soldOut]);
		outfits.searchContainingShouldReturn([
			OutfitMother.create({
				name: "Look",
				productIds: ["viewed", "other"],
			}),
		]);
		const result = await finder.find("viewed");
		expect(
			result.kind === "outfits" &&
				result.outfits[0].products[1].totalOnlineStock,
		).toBe(0);
	});

	it("fall back to collection products when no displayable outfit exists", async () => {
		outfits.searchContainingShouldReturn([
			OutfitMother.create({ name: "Broken", productIds: ["viewed"] }),
		]);
		const result = await finder.find("viewed");
		expect(
			result.kind === "collection" &&
				result.products.map((product) => product.id),
		).toEqual(["related"]);
		products.expectSearchOthersSameCollectionFirstToHaveBeenCalledWith(
			viewed,
			4,
		);
	});

	it("return an empty collection response when the product does not exist", async () => {
		products.searchShouldReturn(null);
		expect(await finder.find("missing")).toEqual({
			kind: "collection",
			products: [],
		});
	});
});
