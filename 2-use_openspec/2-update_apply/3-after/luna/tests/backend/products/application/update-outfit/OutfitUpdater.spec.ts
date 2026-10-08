import { describe, expect, it } from "vitest";

import { OutfitUpdater } from "@/contexts/backend/products/application/update-outfit/OutfitUpdater";
import {
	OutfitNameAlreadyExistsError,
	OutfitNotFoundError,
} from "@/contexts/backend/products/domain/errors/OutfitErrors";
import { Outfit } from "@/contexts/backend/products/domain/Outfit";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";

describe("OutfitUpdater", () => {
	it("allows keeping the current name and replacing products", async () => {
		const outfits = Mock.create<OutfitRepository>();
		const products = Mock.create<ProductRepository>();
		const current = OutfitMother.create({
			id: "o1",
			name: "Look",
			productIds: ["a", "b"],
		});
		outfits.searchShouldReturn(current);
		outfits.searchByNameShouldReturn(current);
		products.searchByIdsShouldReturn([
			ProductMother.create({ id: "b" }),
			ProductMother.create({ id: "c" }),
		]);
		await new OutfitUpdater(outfits, products).update("o1", "Look", [
			"b",
			"c",
		]);
		expect(outfits.save).toHaveBeenCalled();
	});
	it("rejects missing outfits and names owned by another outfit", async () => {
		const outfits = Mock.create<OutfitRepository>();
		const products = Mock.create<ProductRepository>();
		const updater = new OutfitUpdater(outfits, products);
		outfits.searchShouldReturn(null);
		await expect(
			updater.update("missing", "Look", ["a", "b"]),
		).rejects.toBeInstanceOf(OutfitNotFoundError);
		outfits.searchShouldReturn(
			Outfit.fromPrimitives({
				id: "o1",
				name: "Current",
				productIds: ["a", "b"],
			}),
		);
		outfits.searchByNameShouldReturn(
			Outfit.fromPrimitives({
				id: "o2",
				name: "Taken",
				productIds: ["a", "b"],
			}),
		);
		await expect(
			updater.update("o1", "Taken", ["a", "b"]),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
	});
});
