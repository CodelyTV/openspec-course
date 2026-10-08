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
		productRepository,
		outfitRepository,
	);

	const hexagonal = ProductMother.create({
		id: "hexagonal",
		name: "Hexagonal Overshirt",
	});
	const tee = ProductMother.create({ id: "tee", name: "Pure Function Tee" });
	const trousers = ProductMother.create({
		id: "trousers",
		name: "Bounded Context Trousers",
	});
	const jacket = ProductMother.create({
		id: "jacket",
		name: "Observability Jacket",
	});

	function givenTheProductBelongsToOutfits(
		...outfits: ReturnType<typeof OutfitMother.create>[]
	): void {
		productRepository.searchShouldReturn(hexagonal);
		outfitRepository.searchContainingShouldReturn(outfits);
	}

	it("show the outfits of the product with its pieces in the order the admin set", async () => {
		givenTheProductBelongsToOutfits(
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["jacket", "hexagonal", "tee"],
			}),
		);
		productRepository.searchByIdsShouldReturn([tee, hexagonal, jacket]);

		expect(await finder.find("hexagonal")).toEqual({
			kind: "outfits",
			outfits: [
				{
					name: "Weekend Refactor",
					products: [jacket, hexagonal, tee].map(toProductResponse),
				},
			],
		});
	});

	it("show every outfit of the product ordered by name", async () => {
		givenTheProductBelongsToOutfits(
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["hexagonal", "tee"],
			}),
			OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["hexagonal", "trousers"],
			}),
		);
		productRepository.searchByIdsShouldReturn([tee, trousers, hexagonal]);

		const response = await finder.find("hexagonal");

		expect(
			response.kind === "outfits" &&
				response.outfits.map((outfit) => outfit.name),
		).toEqual(["Deploy Friday", "Weekend Refactor"]);
	});

	it("hide outfits left with fewer than two products and fall back to the collection when none is left", async () => {
		givenTheProductBelongsToOutfits(
			OutfitMother.create({ name: "Solo", productIds: ["hexagonal"] }),
		);
		productRepository.searchOthersSameCollectionFirstShouldReturn([
			tee,
			jacket,
		]);

		expect(await finder.find("hexagonal")).toEqual({
			kind: "collection",
			products: [tee, jacket].map(toProductResponse),
		});
	});

	it("keep the displayable outfits when another one of the product is hidden", async () => {
		givenTheProductBelongsToOutfits(
			OutfitMother.create({ name: "Solo", productIds: ["hexagonal"] }),
			OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["hexagonal", "tee"],
			}),
		);
		productRepository.searchByIdsShouldReturn([tee, hexagonal]);

		expect(await finder.find("hexagonal")).toEqual({
			kind: "outfits",
			outfits: [
				{
					name: "Deploy Friday",
					products: [hexagonal, tee].map(toProductResponse),
				},
			],
		});
	});

	it("keep the pieces that are sold out", async () => {
		const soldOut = ProductMother.create({
			id: "trousers",
			name: "Bounded Context Trousers",
			variants: [
				ProductVariantMother.createPrimitives({ onlineStock: 0 }),
			],
		});
		givenTheProductBelongsToOutfits(
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["hexagonal", "trousers"],
			}),
		);
		productRepository.searchByIdsShouldReturn([hexagonal, soldOut]);

		const response = await finder.find("hexagonal");

		expect(
			response.kind === "outfits" &&
				response.outfits[0].products.map((product) => product.id),
		).toEqual(["hexagonal", "trousers"]);
	});

	it("suggest up to four other products of the same collection when the product is in no outfit", async () => {
		givenTheProductBelongsToOutfits();
		productRepository.searchOthersSameCollectionFirstShouldReturn([
			tee,
			jacket,
		]);

		expect(await finder.find("hexagonal")).toEqual({
			kind: "collection",
			products: [tee, jacket].map(toProductResponse),
		});
		productRepository.expectSearchOthersSameCollectionFirstToHaveBeenCalledWith(
			hexagonal,
			4,
		);
	});

	it("find no suggestions for a product that does not exist", async () => {
		productRepository.searchShouldReturn(null);

		expect(await finder.find("ghost")).toEqual({
			kind: "collection",
			products: [],
		});
		outfitRepository.expectSearchContainingNotToHaveBeenCalled();
	});
});
