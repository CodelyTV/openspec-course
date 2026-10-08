import { describe, expect, it } from "vitest";

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

	const tee = ProductMother.create({ id: "tee" });
	const trousers = ProductMother.create({ id: "trousers" });
	const jacket = ProductMother.create({ id: "jacket" });
	const hoodie = ProductMother.create({ id: "hoodie" });
	const shirt = ProductMother.create({ id: "shirt" });

	function givenCatalog(...products: (typeof tee)[]): void {
		productRepository.searchByIdsShouldReturn(products);
		outfitRepository.searchByNameShouldReturn(null);
		idGenerator.generateShouldReturn("outfit-1");
	}

	it("save a valid outfit with its products in the order given", async () => {
		givenCatalog(tee, trousers, jacket);

		await creator.create("Weekend Refactor", ["jacket", "tee", "trousers"]);

		outfitRepository.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: "outfit-1",
				name: "Weekend Refactor",
				productIds: ["jacket", "tee", "trousers"],
			}),
		);
	});

	it("save an outfit with four products", async () => {
		givenCatalog(tee, trousers, jacket, hoodie);

		await creator.create("Full Look", [
			"tee",
			"trousers",
			"jacket",
			"hoodie",
		]);

		outfitRepository.expectSaveToHaveBeenCalled();
	});

	it("reject an outfit with only one product", async () => {
		givenCatalog(tee);

		await expect(creator.create("Solo", ["tee"])).rejects.toBeInstanceOf(
			InvalidOutfitSizeError,
		);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("reject an outfit with five products", async () => {
		givenCatalog(tee, trousers, jacket, hoodie, shirt);

		await expect(
			creator.create("Too Much", [
				"tee",
				"trousers",
				"jacket",
				"hoodie",
				"shirt",
			]),
		).rejects.toBeInstanceOf(InvalidOutfitSizeError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("reject an outfit that lists the same product twice", async () => {
		givenCatalog(tee, trousers);

		await expect(
			creator.create("Twice", ["tee", "tee", "trousers"]),
		).rejects.toBeInstanceOf(RepeatedOutfitProductError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("reject an outfit with a blank name", async () => {
		givenCatalog(tee, trousers);

		await expect(
			creator.create("   ", ["tee", "trousers"]),
		).rejects.toBeInstanceOf(InvalidOutfitNameError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("reject an outfit that references a product not in the catalog", async () => {
		givenCatalog(tee);

		await expect(
			creator.create("Ghost", ["tee", "ghost"]),
		).rejects.toBeInstanceOf(OutfitProductNotFoundError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("reject a name already used by another outfit", async () => {
		givenCatalog(tee, trousers);
		outfitRepository.searchByNameShouldReturn(
			OutfitMother.create({ id: "other-outfit", name: "Deploy Friday" }),
		);

		await expect(
			creator.create("Deploy Friday", ["tee", "trousers"]),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});
});
