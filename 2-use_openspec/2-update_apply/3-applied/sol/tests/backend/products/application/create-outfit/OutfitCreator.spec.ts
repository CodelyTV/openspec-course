import { beforeEach, describe, expect, it } from "vitest";

import { OutfitCreator } from "@/contexts/backend/products/application/create-outfit/OutfitCreator";
import {
	InvalidOutfitNameError,
	InvalidOutfitSizeError,
	OutfitNameAlreadyExistsError,
	OutfitProductNotFoundError,
	RepeatedOutfitProductError,
} from "@/contexts/backend/products/domain/errors/OutfitErrors";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";

describe("OutfitCreator should", () => {
	const outfits = Mock.create<OutfitRepository>();
	const products = Mock.create<ProductRepository>();
	const ids = Mock.create<IdGenerator>();
	const creator = new OutfitCreator(outfits, products, ids);

	beforeEach(() => {
		ids.generateShouldReturn("new-outfit");
		outfits.searchByNameShouldReturn(null);
		products.searchByIdsShouldReturn([
			ProductMother.create({ id: "a" }),
			ProductMother.create({ id: "b" }),
		]);
	});

	it("save a valid outfit with products in order", async () => {
		await creator.create(" Look ", ["b", "a"]);
		outfits.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: "new-outfit",
				name: "Look",
				productIds: ["b", "a"],
			}),
		);
	});

	it.each([
		{ name: "  ", ids: ["a", "b"], error: InvalidOutfitNameError },
		{ name: "Look", ids: ["a"], error: InvalidOutfitSizeError },
		{
			name: "Look",
			ids: ["a", "b", "c", "d", "e"],
			error: InvalidOutfitSizeError,
		},
		{ name: "Look", ids: ["a", "a"], error: RepeatedOutfitProductError },
	])(
		"reject invalid composition: $ids",
		async ({ name, ids: productIds, error }) => {
			await expect(
				creator.create(name, productIds),
			).rejects.toBeInstanceOf(error);
		},
	);

	it("reject a taken name", async () => {
		outfits.searchByNameShouldReturn(OutfitMother.create({ name: "Look" }));
		await expect(creator.create("Look", ["a", "b"])).rejects.toBeInstanceOf(
			OutfitNameAlreadyExistsError,
		);
	});

	it("reject a missing product", async () => {
		products.searchByIdsShouldReturn([ProductMother.create({ id: "a" })]);
		await expect(creator.create("Look", ["a", "b"])).rejects.toBeInstanceOf(
			OutfitProductNotFoundError,
		);
	});
});
