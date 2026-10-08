import { describe, expect, it } from "vitest";

import { OutfitFinder } from "@/contexts/backend/products/application/find-outfit/OutfitFinder";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("OutfitFinder should", () => {
	const outfitRepository = Mock.create<OutfitRepository>();
	const finder = new OutfitFinder(outfitRepository);

	it("return the outfit with its products in order", async () => {
		outfitRepository.searchShouldReturn(
			OutfitMother.create({
				id: "deploy-friday",
				name: "Deploy Friday",
				productIds: ["hoodie", "tee"],
			}),
		);

		expect(await finder.find("deploy-friday")).toEqual({
			id: "deploy-friday",
			name: "Deploy Friday",
			productIds: ["hoodie", "tee"],
		});
	});

	it("return null when the outfit does not exist", async () => {
		outfitRepository.searchShouldReturn(null);

		expect(await finder.find("ghost")).toBeNull();
	});
});
