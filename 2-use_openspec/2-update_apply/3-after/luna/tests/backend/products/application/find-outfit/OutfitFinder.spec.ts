import { describe, expect, it } from "vitest";

import { OutfitFinder } from "@/contexts/backend/products/application/find-outfit/OutfitFinder";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("OutfitFinder", () => {
	it("returns an outfit for editing or null when missing", async () => {
		const repository = Mock.create<OutfitRepository>();
		repository.searchShouldReturn(
			OutfitMother.create({
				id: "outfit",
				name: "Look",
				productIds: ["a", "b"],
			}),
		);
		expect(await new OutfitFinder(repository).find("outfit")).toEqual({
			id: "outfit",
			name: "Look",
			productIds: ["a", "b"],
		});
		repository.searchShouldReturn(null);
		expect(await new OutfitFinder(repository).find("missing")).toBeNull();
	});
});
