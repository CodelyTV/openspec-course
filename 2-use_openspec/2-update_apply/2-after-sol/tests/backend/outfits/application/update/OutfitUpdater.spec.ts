import { beforeEach, describe, expect, it } from "vitest";

import { OutfitUpdater } from "@/contexts/backend/outfits/application/update/OutfitUpdater";
import { EmptyOutfitNameError } from "@/contexts/backend/outfits/domain/errors/EmptyOutfitNameError";
import { InvalidOutfitPiecesCountError } from "@/contexts/backend/outfits/domain/errors/InvalidOutfitPiecesCountError";
import { OutfitNameAlreadyExistsError } from "@/contexts/backend/outfits/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitNotFoundError } from "@/contexts/backend/outfits/domain/errors/OutfitNotFoundError";
import { OutfitProductNotFoundError } from "@/contexts/backend/outfits/domain/errors/OutfitProductNotFoundError";
import { RepeatedOutfitProductError } from "@/contexts/backend/outfits/domain/errors/RepeatedOutfitProductError";
import type { OutfitCatalog } from "@/contexts/backend/outfits/domain/OutfitCatalog";
import type { OutfitRepository } from "@/contexts/backend/outfits/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("OutfitUpdater should", () => {
	const repository = Mock.create<OutfitRepository>();
	const catalog = Mock.create<OutfitCatalog>();
	const creator = new OutfitUpdater(repository, catalog);
	const outfit = OutfitMother.create();
	beforeEach(() => {
		repository.searchShouldReturn(outfit);
		catalog.searchExistingProductIdsShouldReturn([...outfit.productIds]);
		repository.searchByNameShouldReturn(null);
	});
	it("save a valid outfit in order keeping its id", async () => {
		const { name, productIds } = outfit.toPrimitives();
		await creator.update(outfit.id.value, name, productIds);
		repository.expectSaveToHaveBeenCalledWith(outfit);
		catalog.expectSearchExistingProductIdsToHaveBeenCalledWith([
			...outfit.productIds,
		]);
	});
	it.each(["", "   "])("reject empty name %s", async (name) => {
		await expect(
			creator.update(
				outfit.id.value,
				name,
				outfit.toPrimitives().productIds,
			),
		).rejects.toBeInstanceOf(EmptyOutfitNameError);
		repository.expectSaveNotToHaveBeenCalled();
	});
	it.each([[], ["a"], ["a", "b", "c", "d", "e"]])(
		"reject invalid pieces count %j",
		async (...pieces) => {
			await expect(
				creator.update(outfit.id.value, "Look", pieces),
			).rejects.toBeInstanceOf(InvalidOutfitPiecesCountError);
			repository.expectSaveNotToHaveBeenCalled();
		},
	);
	it("reject repeated products without saving", async () => {
		await expect(
			creator.update(outfit.id.value, "Look", ["a", "a"]),
		).rejects.toBeInstanceOf(RepeatedOutfitProductError);
		repository.expectSaveNotToHaveBeenCalled();
	});
	it("reject unknown products without saving", async () => {
		catalog.searchExistingProductIdsShouldReturn([outfit.productIds[0]]);
		await expect(
			creator.update(
				outfit.id.value,
				outfit.name.value,
				outfit.toPrimitives().productIds,
			),
		).rejects.toBeInstanceOf(OutfitProductNotFoundError);
		repository.expectSaveNotToHaveBeenCalled();
	});
	it("reject duplicate names without saving", async () => {
		repository.searchByNameShouldReturn(OutfitMother.create());
		await expect(
			creator.update(
				outfit.id.value,
				outfit.name.value,
				outfit.toPrimitives().productIds,
			),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		repository.expectSearchByNameToHaveBeenCalledWith(outfit.name);
		repository.expectSaveNotToHaveBeenCalled();
	});
	it("reject an unknown outfit", async () => {
		repository.searchShouldReturn(null);
		await expect(
			creator.update(
				"missing",
				outfit.name.value,
				outfit.toPrimitives().productIds,
			),
		).rejects.toBeInstanceOf(OutfitNotFoundError);
		repository.expectSaveNotToHaveBeenCalled();
	});
	it.each(["Office look", "office LOOK", " Office look "])(
		"allow its own normalized name %s",
		async (name) => {
			const current = OutfitMother.create({
				...outfit.toPrimitives(),
				name: "Office look",
			});
			repository.searchShouldReturn(current);
			repository.searchByNameShouldReturn(current);
			await creator.update(
				current.id.value,
				name,
				current.toPrimitives().productIds,
			);
			repository.expectSaveToHaveBeenCalledWith(
				OutfitMother.create({ ...current.toPrimitives(), name }),
			);
		},
	);
});
