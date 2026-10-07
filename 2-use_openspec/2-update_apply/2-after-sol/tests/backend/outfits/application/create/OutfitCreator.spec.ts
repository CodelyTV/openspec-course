import { beforeEach, describe, expect, it } from "vitest";

import { OutfitCreator } from "@/contexts/backend/outfits/application/create/OutfitCreator";
import { EmptyOutfitNameError } from "@/contexts/backend/outfits/domain/errors/EmptyOutfitNameError";
import { InvalidOutfitPiecesCountError } from "@/contexts/backend/outfits/domain/errors/InvalidOutfitPiecesCountError";
import { OutfitNameAlreadyExistsError } from "@/contexts/backend/outfits/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitProductNotFoundError } from "@/contexts/backend/outfits/domain/errors/OutfitProductNotFoundError";
import { RepeatedOutfitProductError } from "@/contexts/backend/outfits/domain/errors/RepeatedOutfitProductError";
import type { OutfitCatalog } from "@/contexts/backend/outfits/domain/OutfitCatalog";
import type { OutfitRepository } from "@/contexts/backend/outfits/domain/OutfitRepository";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("OutfitCreator should", () => {
	const repository = Mock.create<OutfitRepository>();
	const catalog = Mock.create<OutfitCatalog>();
	const ids = Mock.create<IdGenerator>();
	const creator = new OutfitCreator(repository, ids, catalog);
	const outfit = OutfitMother.create();
	beforeEach(() => {
		ids.generateShouldReturn(outfit.id.value);
		catalog.searchExistingProductIdsShouldReturn([...outfit.productIds]);
		repository.searchByNameShouldReturn(null);
	});
	it("save a valid outfit in order with a generated id", async () => {
		const { name, productIds } = outfit.toPrimitives();
		await creator.create(name, productIds);
		repository.expectSaveToHaveBeenCalledWith(outfit);
		catalog.expectSearchExistingProductIdsToHaveBeenCalledWith([
			...outfit.productIds,
		]);
	});
	it.each(["", "   "])("reject empty name %s", async (name) => {
		await expect(
			creator.create(name, outfit.toPrimitives().productIds),
		).rejects.toBeInstanceOf(EmptyOutfitNameError);
		repository.expectSaveNotToHaveBeenCalled();
	});
	it.each([[], ["a"], ["a", "b", "c", "d", "e"]])(
		"reject invalid pieces count %j",
		async (...pieces) => {
			await expect(creator.create("Look", pieces)).rejects.toBeInstanceOf(
				InvalidOutfitPiecesCountError,
			);
			repository.expectSaveNotToHaveBeenCalled();
		},
	);
	it("reject repeated products without saving", async () => {
		await expect(creator.create("Look", ["a", "a"])).rejects.toBeInstanceOf(
			RepeatedOutfitProductError,
		);
		repository.expectSaveNotToHaveBeenCalled();
	});
	it("reject unknown products without saving", async () => {
		catalog.searchExistingProductIdsShouldReturn([outfit.productIds[0]]);
		await expect(
			creator.create(outfit.name.value, outfit.toPrimitives().productIds),
		).rejects.toBeInstanceOf(OutfitProductNotFoundError);
		repository.expectSaveNotToHaveBeenCalled();
	});
	it("reject duplicate names without saving", async () => {
		repository.searchByNameShouldReturn(OutfitMother.create());
		await expect(
			creator.create(outfit.name.value, outfit.toPrimitives().productIds),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		repository.expectSearchByNameToHaveBeenCalledWith(outfit.name);
		repository.expectSaveNotToHaveBeenCalled();
	});
});
