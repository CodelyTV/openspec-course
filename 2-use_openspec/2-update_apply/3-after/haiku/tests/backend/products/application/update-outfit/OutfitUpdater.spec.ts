import { beforeEach, describe, expect, it } from "vitest";

import { OutfitUpdater } from "@/contexts/backend/products/application/update-outfit/OutfitUpdater";
import { InvalidOutfitSizeError } from "@/contexts/backend/products/domain/errors/InvalidOutfitSizeError";
import { OutfitNameAlreadyExistsError } from "@/contexts/backend/products/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitNotFoundError";
import { OutfitProductNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitProductNotFoundError";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";

describe("OutfitUpdater should", () => {
	const outfitRepository = Mock.create<OutfitRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const updater = new OutfitUpdater(outfitRepository, productRepository);

	const tee = ProductMother.create({ id: "tee" });
	const trousers = ProductMother.create({ id: "trousers" });
	const jacket = ProductMother.create({ id: "jacket" });
	const existing = OutfitMother.create({
		id: "deploy-friday",
		name: "Deploy Friday",
		productIds: ["tee", "trousers"],
	});

	beforeEach(() => {
		outfitRepository.searchShouldReturn(existing);
		outfitRepository.searchByNameShouldReturn(existing);
		productRepository.searchByIdsShouldReturn([tee, trousers, jacket]);
	});

	it("save the outfit keeping its name and replacing its products", async () => {
		await updater.update("deploy-friday", "Deploy Friday", [
			"jacket",
			"tee",
		]);

		outfitRepository.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: "deploy-friday",
				name: "Deploy Friday",
				productIds: ["jacket", "tee"],
			}),
		);
	});

	it("reject renaming the outfit to the name of another outfit", async () => {
		outfitRepository.searchByNameShouldReturn(
			OutfitMother.create({
				id: "weekend-refactor",
				name: "Weekend Refactor",
			}),
		);

		await expect(
			updater.update("deploy-friday", "Weekend Refactor", [
				"tee",
				"trousers",
			]),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail when the outfit no longer exists", async () => {
		outfitRepository.searchShouldReturn(null);

		await expect(
			updater.update("deleted-outfit", "Deploy Friday", [
				"tee",
				"trousers",
			]),
		).rejects.toBeInstanceOf(OutfitNotFoundError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("apply the same product rules as creation", async () => {
		await expect(
			updater.update("deploy-friday", "Deploy Friday", ["tee"]),
		).rejects.toBeInstanceOf(InvalidOutfitSizeError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("reject a product that is no longer in the catalog", async () => {
		await expect(
			updater.update("deploy-friday", "Deploy Friday", ["tee", "ghost"]),
		).rejects.toBeInstanceOf(OutfitProductNotFoundError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});
});
