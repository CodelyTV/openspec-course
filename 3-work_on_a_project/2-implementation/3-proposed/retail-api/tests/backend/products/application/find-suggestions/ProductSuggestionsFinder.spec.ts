import { describe, expect, it } from "vitest";

import { ProductSuggestionsFinder } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";
import { toProductResponse } from "@/contexts/backend/products/application/ProductResponse";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("ProductSuggestionsFinder should", () => {
	const outfitRepository = Mock.create<OutfitRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const finder = new ProductSuggestionsFinder(
		outfitRepository,
		productRepository,
	);

	const overshirt = ProductMother.create({ id: "overshirt" });
	const tee = ProductMother.create({ id: "tee" });
	const chinos = ProductMother.create({ id: "chinos" });

	it("suggest the outfit the product belongs to with all its pieces in order", async () => {
		productRepository.searchShouldReturn(overshirt);
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["tee", "overshirt", "chinos"],
			}),
		]);
		productRepository.searchByIdsShouldReturn([chinos, overshirt, tee]);

		expect(await finder.find("overshirt")).toEqual({
			kind: "outfits",
			outfits: [
				{
					name: "Weekend Refactor",
					products: [tee, overshirt, chinos].map(toProductResponse),
				},
			],
		});
		outfitRepository.expectSearchContainingToHaveBeenCalledWith(
			overshirt.id,
		);
		productRepository.expectSearchOthersSameCollectionFirstNotToHaveBeenCalled();
	});

	it("suggest every outfit of the product ordered by name", async () => {
		productRepository.searchShouldReturn(tee);
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["tee", "chinos"],
			}),
			OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["overshirt", "tee"],
			}),
		]);
		productRepository.searchByIdsShouldReturn([overshirt, tee, chinos]);

		const suggestions = await finder.find("tee");

		expect(
			suggestions.kind === "outfits" &&
				suggestions.outfits.map((outfit) => outfit.name),
		).toEqual(["Deploy Friday", "Weekend Refactor"]);
	});

	it("hide an outfit left with fewer than 2 products", async () => {
		productRepository.searchShouldReturn(tee);
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.withOnlyOneProductLeft({
				name: "Deploy Friday",
				productId: "tee",
			}),
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["tee", "chinos"],
			}),
		]);
		productRepository.searchByIdsShouldReturn([tee, chinos]);

		const suggestions = await finder.find("tee");

		expect(
			suggestions.kind === "outfits" &&
				suggestions.outfits.map((outfit) => outfit.name),
		).toEqual(["Weekend Refactor"]);
	});

	it("keep sold-out pieces in the outfit", async () => {
		const soldOutChinos = ProductMother.create({
			id: "chinos",
			variants: [
				ProductVariantMother.createPrimitives({ onlineStock: 0 }),
			],
		});
		productRepository.searchShouldReturn(tee);
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["tee", "chinos"],
			}),
		]);
		productRepository.searchByIdsShouldReturn([tee, soldOutChinos]);

		expect(await finder.find("tee")).toEqual({
			kind: "outfits",
			outfits: [
				{
					name: "Deploy Friday",
					products: [tee, soldOutChinos].map(toProductResponse),
				},
			],
		});
	});

	it("fall back to up to 4 other products, those of the same collection first, when the product is in no outfit", async () => {
		const others = [tee, chinos];
		productRepository.searchShouldReturn(overshirt);
		outfitRepository.searchContainingShouldReturn([]);
		productRepository.searchOthersSameCollectionFirstShouldReturn(others);

		expect(await finder.find("overshirt")).toEqual({
			kind: "collection",
			products: others.map(toProductResponse),
		});
		productRepository.expectSearchOthersSameCollectionFirstToHaveBeenCalledWith(
			overshirt,
			4,
		);
	});

	it("fall back to the collection when the only outfit of the product is left with 1 product", async () => {
		productRepository.searchShouldReturn(tee);
		outfitRepository.searchContainingShouldReturn([
			OutfitMother.withOnlyOneProductLeft({ productId: "tee" }),
		]);
		productRepository.searchOthersSameCollectionFirstShouldReturn([chinos]);

		expect(await finder.find("tee")).toEqual({
			kind: "collection",
			products: [toProductResponse(chinos)],
		});
	});

	it("suggest nothing when the product is in no outfit and there are no other products", async () => {
		productRepository.searchShouldReturn(tee);
		outfitRepository.searchContainingShouldReturn([]);
		productRepository.searchOthersSameCollectionFirstShouldReturn([]);

		expect(await finder.find("tee")).toEqual({
			kind: "collection",
			products: [],
		});
	});

	it("suggest nothing when the product does not exist", async () => {
		productRepository.searchShouldReturn(null);

		expect(await finder.find("ghost")).toEqual({
			kind: "collection",
			products: [],
		});
		outfitRepository.expectSearchContainingNotToHaveBeenCalled();
	});
});
