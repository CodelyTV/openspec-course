import { beforeEach, describe, expect, it } from "vitest";

import { OutfitUpdater } from "@/contexts/backend/products/application/update-outfit/OutfitUpdater";
import { InvalidOutfitSizeError } from "@/contexts/backend/products/domain/errors/InvalidOutfitSizeError";
import { OutfitNameAlreadyExistsError } from "@/contexts/backend/products/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitNotFoundError";
import { OutfitProductNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitProductNotFoundError";
import type { Outfit } from "@/contexts/backend/products/domain/Outfit";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";

describe("OutfitUpdater should", () => {
	const outfitRepository = Mock.create<OutfitRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const updater = new OutfitUpdater(outfitRepository, productRepository);

	let deployFriday: Outfit;

	function givenCatalogProducts(...ids: string[]): void {
		productRepository.searchByIdsShouldReturn(
			ids.map((id) => ProductMother.create({ id })),
		);
	}

	beforeEach(() => {
		deployFriday = OutfitMother.create({
			name: "Deploy Friday",
			productIds: ["tee", "chinos"],
		});
		outfitRepository.searchShouldReturn(deployFriday);
		outfitRepository.searchByNameShouldReturn(null);
	});

	it("replace the products of an outfit", async () => {
		givenCatalogProducts("tee", "jacket");

		await updater.update(deployFriday.id.value, "Deploy Friday", [
			"tee",
			"jacket",
		]);

		outfitRepository.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: deployFriday.id.value,
				name: "Deploy Friday",
				productIds: ["tee", "jacket"],
			}),
		);
	});

	it("save an outfit that keeps its own name", async () => {
		givenCatalogProducts("tee", "jacket");
		outfitRepository.searchByNameShouldReturn(deployFriday);

		await updater.update(deployFriday.id.value, "Deploy Friday", [
			"jacket",
			"tee",
		]);

		outfitRepository.expectSaveToHaveBeenCalled();
	});

	it("rename an outfit to a free name", async () => {
		givenCatalogProducts("tee", "chinos");

		await updater.update(deployFriday.id.value, "Weekend Refactor", [
			"tee",
			"chinos",
		]);

		outfitRepository.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: deployFriday.id.value,
				name: "Weekend Refactor",
				productIds: ["tee", "chinos"],
			}),
		);
	});

	it("reject renaming an outfit to the name of another outfit", async () => {
		givenCatalogProducts("tee", "chinos");
		outfitRepository.searchByNameShouldReturn(
			OutfitMother.create({ name: "Weekend Refactor" }),
		);

		await expect(
			updater.update(deployFriday.id.value, "Weekend Refactor", [
				"tee",
				"chinos",
			]),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("apply the same composition rules as creation", async () => {
		await expect(
			updater.update(deployFriday.id.value, "Deploy Friday", ["tee"]),
		).rejects.toBeInstanceOf(InvalidOutfitSizeError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("reject an outfit left with one product until it gets at least two", async () => {
		const leftWithOneProduct = OutfitMother.withOnlyOneProductLeft({
			productId: "tee",
		});
		outfitRepository.searchShouldReturn(leftWithOneProduct);

		await expect(
			updater.update(
				leftWithOneProduct.id.value,
				leftWithOneProduct.name,
				["tee"],
			),
		).rejects.toBeInstanceOf(InvalidOutfitSizeError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("reject products that are not in the catalog", async () => {
		givenCatalogProducts("tee");

		await expect(
			updater.update(deployFriday.id.value, "Deploy Friday", [
				"tee",
				"ghost",
			]),
		).rejects.toBeInstanceOf(OutfitProductNotFoundError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail when the outfit no longer exists", async () => {
		outfitRepository.searchShouldReturn(null);

		await expect(
			updater.update("ghost", "Deploy Friday", ["tee", "chinos"]),
		).rejects.toBeInstanceOf(OutfitNotFoundError);
		outfitRepository.expectSaveNotToHaveBeenCalled();
	});
});
