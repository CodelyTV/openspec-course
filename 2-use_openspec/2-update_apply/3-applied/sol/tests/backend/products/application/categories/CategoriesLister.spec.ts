import { describe, expect, it } from "vitest";

import { CategoriesLister } from "@/contexts/backend/products/application/categories/CategoriesLister";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";

describe("CategoriesLister should", () => {
	const repository = Mock.create<ProductRepository>();
	const lister = new CategoriesLister(repository);

	it("list the categories of the catalog", async () => {
		repository.searchCategoriesShouldReturn(["Hoodies", "Tees"]);

		expect(await lister.list()).toEqual(["Hoodies", "Tees"]);
	});

	it("return no categories when the catalog is empty", async () => {
		repository.searchCategoriesShouldReturn([]);

		expect(await lister.list()).toEqual([]);
	});
});
