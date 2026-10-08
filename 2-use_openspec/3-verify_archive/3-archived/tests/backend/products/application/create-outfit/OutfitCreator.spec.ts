import { beforeEach, describe, expect, it } from "vitest";

import { OutfitCreator } from "@/contexts/backend/products/application/create-outfit/OutfitCreator";
import { InvalidOutfitNameError } from "@/contexts/backend/products/domain/errors/InvalidOutfitNameError";
import { InvalidOutfitSizeError } from "@/contexts/backend/products/domain/errors/InvalidOutfitSizeError";
import { OutfitNameAlreadyExistsError } from "@/contexts/backend/products/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitProductNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitProductNotFoundError";
import { RepeatedOutfitProductError } from "@/contexts/backend/products/domain/errors/RepeatedOutfitProductError";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";

describe("OutfitCreator should", () => {
	const outfitRepository = Mock.create<OutfitRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const idGenerator = Mock.create<IdGenerator>();
	const creator = new OutfitCreator(
		outfitRepository,
		productRepository,
		idGenerator,
	);
	const newOutfitId = "0b8e3c1a-7f42-4d19-a6c5-93e1d2b7f480";

	function givenCatalogProducts(...ids: string[]): void {
		productRepository.searchByIdsShouldReturn(
			ids.map((id) => ProductMother.create({ id })),
		);
	}

	beforeEach(() => {
		idGenerator.generateShouldReturn(newOutfitId);
		outfitRepository.searchByNameShouldReturn(null);
	});

	it("save a valid outfit with its products in the order given", async () => {
		givenCatalogProducts("tee", "chinos", "jacket");

		await creator.create("Weekend Refactor", ["jacket", "tee", "chinos"]);

		outfitRepository.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: newOutfitId,
				name: "Weekend Refactor",
				productIds: ["jacket", "tee", "chinos"],
			}),
		);
	});

	it("save the name without surrounding blanks", async () => {
		givenCatalogProducts("tee", "chinos");

		await creator.create("  Deploy Friday ", ["tee", "chinos"]);

		outfitRepository.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: newOutfitId,
				name: "Deploy Friday",
				productIds: ["tee", "chinos"],
			}),
		);
	});

	it.each([
		["only 1 product", ["tee"]],
		["5 products", ["a", "b", "c", "d", "e"]],
	])("reject an outfit with %s", async (_case, productIds) => {
		await expect(
			creator.create("Deploy Friday", productIds),
		).rejects.toBeInstanceOf(InvalidOutfitSizeError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("reject an outfit that lists the same product twice", async () => {
		await expect(
			creator.create("Deploy Friday", ["tee", "chinos", "tee"]),
		).rejects.toBeInstanceOf(RepeatedOutfitProductError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it.each(["", "   "])(
		"reject an outfit with a blank name (%j)",
		async (name) => {
			await expect(
				creator.create(name, ["tee", "chinos"]),
			).rejects.toBeInstanceOf(InvalidOutfitNameError);
			outfitRepository.expectSaveNotToHaveBeenCalled();
		},
	);

	it("reject an outfit referencing a product that is not in the catalog", async () => {
		givenCatalogProducts("tee");

		await expect(
			creator.create("Deploy Friday", ["tee", "ghost"]),
		).rejects.toBeInstanceOf(OutfitProductNotFoundError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("reject an outfit whose name is already taken", async () => {
		givenCatalogProducts("tee", "chinos");
		outfitRepository.searchByNameShouldReturn(
			OutfitMother.create({ name: "Deploy Friday" }),
		);

		await expect(
			creator.create("Deploy Friday", ["tee", "chinos"]),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		outfitRepository.expectSearchByNameToHaveBeenCalledWith(
			"Deploy Friday",
		);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});
});
