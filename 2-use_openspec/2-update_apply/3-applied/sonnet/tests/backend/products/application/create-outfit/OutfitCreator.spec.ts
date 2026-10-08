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

	const outfitId = "6f1c2d3e-4a5b-4c6d-8e7f-9a0b1c2d3e4f";
	const products = ["tee", "jeans", "hoodie", "cap", "socks"].map((id) =>
		ProductMother.create({ id }),
	);

	beforeEach(() => {
		idGenerator.generateShouldReturn(outfitId);
		productRepository.searchByIdsShouldReturn(products);
		outfitRepository.searchByNameShouldReturn(null);
	});

	it("save an outfit with its products in the order given", async () => {
		await creator.create("Weekend Refactor", ["hoodie", "tee", "jeans"]);

		outfitRepository.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: outfitId,
				name: "Weekend Refactor",
				productIds: ["hoodie", "tee", "jeans"],
			}),
		);
	});

	it("fail with a single product", async () => {
		await expect(
			creator.create("Weekend Refactor", ["tee"]),
		).rejects.toBeInstanceOf(InvalidOutfitSizeError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail with five products", async () => {
		await expect(
			creator.create("Weekend Refactor", [
				"tee",
				"jeans",
				"hoodie",
				"cap",
				"socks",
			]),
		).rejects.toBeInstanceOf(InvalidOutfitSizeError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail when a product is listed twice", async () => {
		await expect(
			creator.create("Weekend Refactor", ["tee", "jeans", "tee"]),
		).rejects.toBeInstanceOf(RepeatedOutfitProductError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail with a blank name", async () => {
		await expect(
			creator.create("   ", ["tee", "jeans"]),
		).rejects.toBeInstanceOf(InvalidOutfitNameError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail when a product does not exist in the catalog", async () => {
		await expect(
			creator.create("Weekend Refactor", ["tee", "ghost"]),
		).rejects.toBeInstanceOf(OutfitProductNotFoundError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail when another outfit already has the name", async () => {
		outfitRepository.searchByNameShouldReturn(
			OutfitMother.create({ name: "Deploy Friday" }),
		);

		await expect(
			creator.create("Deploy Friday", ["tee", "jeans"]),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});
});
