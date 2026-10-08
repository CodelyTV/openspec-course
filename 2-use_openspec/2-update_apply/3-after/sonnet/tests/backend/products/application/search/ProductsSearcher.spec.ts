import { describe, expect, it } from "vitest";

import { toProductResponse } from "@/contexts/backend/products/application/ProductResponse";
import { ProductsSearcher } from "@/contexts/backend/products/application/search/ProductsSearcher";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";

describe("ProductsSearcher should", () => {
	const repository = Mock.create<ProductRepository>();
	const searcher = new ProductsSearcher(repository);

	it("return every product mapped to a response when no filter is given", async () => {
		const products = [ProductMother.create(), ProductMother.create()];
		repository.searchMatchingShouldReturn(products);

		expect(await searcher.search()).toEqual(
			products.map(toProductResponse),
		);
		repository.expectSearchMatchingToHaveBeenCalledWith({});
	});

	it("ask the repository only for the products of the requested collection and category", async () => {
		const wanted = ProductMother.create({
			collection: "Architecture Drop",
			category: "T-shirts",
		});
		repository.searchMatchingShouldReturn([wanted]);

		expect(
			await searcher.search({
				collection: "Architecture Drop",
				category: "T-shirts",
			}),
		).toEqual([toProductResponse(wanted)]);
		repository.expectSearchMatchingToHaveBeenCalledWith({
			collection: "Architecture Drop",
			category: "T-shirts",
		});
	});
});
