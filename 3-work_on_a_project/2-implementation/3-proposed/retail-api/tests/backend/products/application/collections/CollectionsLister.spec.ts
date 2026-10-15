import { describe, expect, it } from "vitest";

import { CollectionsLister } from "@/contexts/backend/products/application/collections/CollectionsLister";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";

describe("CollectionsLister should", () => {
	const repository = Mock.create<ProductRepository>();
	const lister = new CollectionsLister(repository);

	it("list the collections of the catalog", async () => {
		repository.searchCollectionsShouldReturn([
			"Architecture Drop",
			"Core Wardrobe",
		]);

		expect(await lister.list()).toEqual([
			"Architecture Drop",
			"Core Wardrobe",
		]);
	});

	it("return no collections when the catalog is empty", async () => {
		repository.searchCollectionsShouldReturn([]);

		expect(await lister.list()).toEqual([]);
	});
});
