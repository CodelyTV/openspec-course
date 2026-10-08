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

	const existing = OutfitMother.create({
		id: "outfit-1",
		name: "Deploy Friday",
		productIds: ["tee", "jeans"],
	});
	const products = ["tee", "jeans", "hoodie"].map((id) =>
		ProductMother.create({ id }),
	);

	beforeEach(() => {
		outfitRepository.searchShouldReturn(existing);
		outfitRepository.searchByNameShouldReturn(null);
		productRepository.searchByIdsShouldReturn(products);
	});

	it("replace the products of an outfit keeping its name", async () => {
		outfitRepository.searchByNameShouldReturn(existing);

		await updater.update("outfit-1", "Deploy Friday", ["tee", "hoodie"]);

		outfitRepository.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: "outfit-1",
				name: "Deploy Friday",
				productIds: ["tee", "hoodie"],
			}),
		);
	});

	it("rename an outfit", async () => {
		await updater.update("outfit-1", "Weekend Refactor", ["tee", "jeans"]);

		outfitRepository.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: "outfit-1",
				name: "Weekend Refactor",
				productIds: ["tee", "jeans"],
			}),
		);
	});

	it("fail when renaming to the name of another outfit", async () => {
		outfitRepository.searchByNameShouldReturn(
			OutfitMother.create({ id: "outfit-2", name: "Weekend Refactor" }),
		);

		await expect(
			updater.update("outfit-1", "Weekend Refactor", ["tee", "jeans"]),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail when the outfit no longer exists", async () => {
		outfitRepository.searchShouldReturn(null);

		await expect(
			updater.update("outfit-1", "Deploy Friday", ["tee", "jeans"]),
		).rejects.toBeInstanceOf(OutfitNotFoundError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("apply the same validation as creation", async () => {
		await expect(
			updater.update("outfit-1", "Deploy Friday", ["tee"]),
		).rejects.toBeInstanceOf(InvalidOutfitSizeError);
		await expect(
			updater.update("outfit-1", "Deploy Friday", ["tee", "ghost"]),
		).rejects.toBeInstanceOf(OutfitProductNotFoundError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});
});
