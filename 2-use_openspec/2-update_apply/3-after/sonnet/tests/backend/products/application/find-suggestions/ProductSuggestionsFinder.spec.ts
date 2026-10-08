import { beforeEach, describe, expect, it } from "vitest";

import { ProductSuggestionsFinder } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";
import { toProductResponse } from "@/contexts/backend/products/application/ProductResponse";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("ProductSuggestionsFinder should", () => {
	const productRepository = Mock.create<ProductRepository>();
	const outfitRepository = Mock.create<OutfitRepository>();
	const finder = new ProductSuggestionsFinder(
		productRepository,
		outfitRepository,
	);

	const overshirt = ProductMother.create({
		id: "overshirt",
		name: "Hexagonal Overshirt",
	});
	const tee = ProductMother.create({ id: "tee", name: "Pure Function Tee" });
	const jeans = ProductMother.create({ id: "jeans", name: "Jeans" });
	const hoodie = ProductMother.create({ id: "hoodie", name: "Hoodie" });

	beforeEach(() => {
		productRepository.searchShouldReturn(overshirt);
		productRepository.searchByIdsShouldReturn([
			overshirt,
			tee,
			jeans,
			hoodie,
		]);
		outfitRepository.searchContainingShouldReturn([]);
		productRepository.searchOthersSameCollectionFirstShouldReturn([]);
	});

	it("suggest the outfit the product belongs to with all its products, the viewed one included", async () => {
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["overshirt", "tee"],
			}),
		]);

		expect(await finder.find("overshirt")).toEqual({
			kind: "outfits",
			outfits: [
				{
					name: "Weekend Refactor",
					products: [overshirt, tee].map(toProductResponse),
				},
			],
		});
		productRepository.expectSearchOthersSameCollectionFirstNotToHaveBeenCalled();
	});

	it("keep the order of the products the admin set", async () => {
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.create({
				productIds: ["jeans", "overshirt", "hoodie", "tee"],
			}),
		]);

		const suggestions = await finder.find("overshirt");

		expect(suggestions).toMatchObject({ kind: "outfits" });
		expect(
			suggestions.kind === "outfits" &&
				suggestions.outfits[0].products.map((product) => product.id),
		).toEqual(["jeans", "overshirt", "hoodie", "tee"]);
	});

	it("suggest every outfit of the product ordered by name", async () => {
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["overshirt", "tee"],
			}),
			OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["overshirt", "jeans"],
			}),
		]);

		const suggestions = await finder.find("overshirt");

		expect(
			suggestions.kind === "outfits" &&
				suggestions.outfits.map((outfit) => outfit.name),
		).toEqual(["Deploy Friday", "Weekend Refactor"]);
	});

	it("hide an outfit left with fewer than two products and fall back to the collection", async () => {
		const related = [tee, jeans];
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.create({ productIds: ["overshirt"] }),
		]);
		productRepository.searchOthersSameCollectionFirstShouldReturn(related);

		expect(await finder.find("overshirt")).toEqual({
			kind: "collection",
			products: related.map(toProductResponse),
		});
	});

	it("show only the displayable outfits when the product has also a broken one", async () => {
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.create({
				name: "Broken",
				productIds: ["overshirt"],
			}),
			OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["overshirt", "jeans"],
			}),
		]);

		const suggestions = await finder.find("overshirt");

		expect(
			suggestions.kind === "outfits" &&
				suggestions.outfits.map((outfit) => outfit.name),
		).toEqual(["Deploy Friday"]);
	});

	it("keep the sold-out products of an outfit", async () => {
		const soldOut = ProductMother.create({
			id: "tee",
			variants: [
				ProductVariantMother.createPrimitives({ onlineStock: 0 }),
			],
		});
		productRepository.searchByIdsShouldReturn([overshirt, soldOut]);
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.create({ productIds: ["overshirt", "tee"] }),
		]);

		const suggestions = await finder.find("overshirt");

		expect(
			suggestions.kind === "outfits" &&
				suggestions.outfits[0].products.map((product) => product.id),
		).toEqual(["overshirt", "tee"]);
	});

	it("suggest up to four products of the collection when the product is in no outfit", async () => {
		const related = [tee, jeans, hoodie];
		productRepository.searchOthersSameCollectionFirstShouldReturn(related);

		expect(await finder.find("overshirt")).toEqual({
			kind: "collection",
			products: related.map(toProductResponse),
		});
		productRepository.expectSearchOthersSameCollectionFirstToHaveBeenCalledWith(
			overshirt,
			4,
		);
	});

	it("suggest nothing when the catalog has no other product", async () => {
		expect(await finder.find("overshirt")).toEqual({
			kind: "collection",
			products: [],
		});
	});

	it("suggest nothing for a product that does not exist", async () => {
		productRepository.searchShouldReturn(null);

		expect(await finder.find("ghost")).toEqual({
			kind: "collection",
			products: [],
		});
		outfitRepository.expectSearchContainingNotToHaveBeenCalled();
	});
});
