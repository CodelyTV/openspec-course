import { beforeEach, describe, expect, it } from "vitest";

import { OutfitUpdater } from "@/contexts/backend/products/application/update-outfit/OutfitUpdater";
import {
	InvalidOutfitSizeError,
	OutfitNameAlreadyExistsError,
	OutfitNotFoundError,
} from "@/contexts/backend/products/domain/errors/OutfitErrors";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";

describe("OutfitUpdater should", () => {
	const outfits = Mock.create<OutfitRepository>();
	const products = Mock.create<ProductRepository>();
	const updater = new OutfitUpdater(outfits, products);
	beforeEach(() => {
		outfits.searchShouldReturn(
			OutfitMother.create({
				id: "existing",
				name: "Look",
				productIds: ["a", "b"],
			}),
		);
		outfits.searchByNameShouldReturn(
			OutfitMother.create({ id: "existing", name: "Look" }),
		);
		products.searchByIdsShouldReturn([
			ProductMother.create({ id: "a" }),
			ProductMother.create({ id: "c" }),
		]);
	});
	it("keep its own name and save replacement products", async () => {
		await updater.update("existing", "Look", ["a", "c"]);
		outfits.expectSaveToHaveBeenCalledWith(
			OutfitMother.create({
				id: "existing",
				name: "Look",
				productIds: ["a", "c"],
			}),
		);
	});
	it("reject a missing outfit", async () => {
		outfits.searchShouldReturn(null);
		await expect(
			updater.update("missing", "Look", ["a", "c"]),
		).rejects.toBeInstanceOf(OutfitNotFoundError);
	});
	it("reject another outfit's name", async () => {
		outfits.searchByNameShouldReturn(
			OutfitMother.create({ id: "another", name: "Taken" }),
		);
		await expect(
			updater.update("existing", "Taken", ["a", "c"]),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
	});
	it("apply composition validation when editing", async () => {
		await expect(
			updater.update("existing", "Look", ["a"]),
		).rejects.toBeInstanceOf(InvalidOutfitSizeError);
	});
});
