import { describe, expect, it } from "vitest";

import { OutfitFinder } from "@/contexts/backend/products/application/find-outfit/OutfitFinder";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("OutfitFinder should", () => {
	const repository = Mock.create<OutfitRepository>();
	const finder = new OutfitFinder(repository);

	it("return the outfit with its products in order", async () => {
		const outfit = OutfitMother.create({
			name: "Deploy Friday",
			productIds: ["jacket", "tee"],
		});
		repository.searchShouldReturn(outfit);

		expect(await finder.find(outfit.id.value)).toEqual({
			id: outfit.id.value,
			name: "Deploy Friday",
			productIds: ["jacket", "tee"],
		});
	});

	it("return null when the outfit does not exist", async () => {
		repository.searchShouldReturn(null);

		expect(await finder.find("ghost")).toBeNull();
	});

	it("return null for a blank id without searching", async () => {
		expect(await finder.find("  ")).toBeNull();
		repository.expectSearchNotToHaveBeenCalled();
	});
});
