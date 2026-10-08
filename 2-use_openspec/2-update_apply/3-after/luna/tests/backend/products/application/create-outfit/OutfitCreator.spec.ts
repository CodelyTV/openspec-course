import { describe, expect, it } from "vitest";

import { OutfitCreator } from "@/contexts/backend/products/application/create-outfit/OutfitCreator";
import {
	OutfitNameAlreadyExistsError,
	OutfitProductNotFoundError,
} from "@/contexts/backend/products/domain/errors/OutfitErrors";
import {
	InvalidOutfitNameError,
	InvalidOutfitSizeError,
	RepeatedOutfitProductError,
} from "@/contexts/backend/products/domain/Outfit";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock, type Mocked } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";

function setup(): {
	outfits: Mocked<OutfitRepository>;
	products: Mocked<ProductRepository>;
	creator: OutfitCreator;
} {
	const outfits = Mock.create<OutfitRepository>();
	const products = Mock.create<ProductRepository>();
	const creator = new OutfitCreator(outfits, products, {
		generate: (): string => "outfit-id",
	});

	return { outfits, products, creator };
}

describe("OutfitCreator", () => {
	it("creates an outfit with existing products", async () => {
		const { outfits, products, creator } = setup();
		products.searchByIdsShouldReturn([
			ProductMother.create({ id: "a" }),
			ProductMother.create({ id: "b" }),
		]);
		outfits.searchByNameShouldReturn(null);
		await creator.create(" Look ", ["a", "b"]);
		expect(outfits.save).toHaveBeenCalled();
	});
	it("rejects blank names, invalid sizes and repeated products", async () => {
		const { creator } = setup();
		await expect(creator.create("  ", ["a", "b"])).rejects.toBeInstanceOf(
			InvalidOutfitNameError,
		);
		await expect(creator.create("Look", ["a"])).rejects.toBeInstanceOf(
			InvalidOutfitSizeError,
		);
		await expect(
			creator.create("Look", ["a", "b", "c", "d", "e"]),
		).rejects.toBeInstanceOf(InvalidOutfitSizeError);
		await expect(creator.create("Look", ["a", "a"])).rejects.toBeInstanceOf(
			RepeatedOutfitProductError,
		);
	});
	it("rejects unavailable products and an existing name", async () => {
		const missing = setup();
		missing.outfits.searchByNameShouldReturn(null);
		missing.products.searchByIdsShouldReturn([]);
		await expect(
			missing.creator.create("Look", ["a", "b"]),
		).rejects.toBeInstanceOf(OutfitProductNotFoundError);
		const duplicate = setup();
		duplicate.outfits.searchByNameShouldReturn({
			id: { value: "other" },
		} as never);
		await expect(
			duplicate.creator.create("Look", ["a", "b"]),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
	});
});
