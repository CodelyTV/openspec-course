import { describe, expect, it } from "vitest";

import { toProductResponse } from "@/contexts/backend/products/application/ProductResponse";
import { ProductsByIdsSearcher } from "@/contexts/backend/products/application/search-by-ids/ProductsByIdsSearcher";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";

describe("ProductsByIdsSearcher should", () => {
	const productRepository = Mock.create<ProductRepository>();
	const searcher = new ProductsByIdsSearcher(productRepository);

	it("return the products found for the given ids", async () => {
		const ada = ProductMother.create();
		productRepository.searchByIdsShouldReturn([ada]);

		expect(await searcher.search([ada.id.value, "product-ghost"])).toEqual([
			toProductResponse(ada),
		]);
		productRepository.expectSearchByIdsToHaveBeenCalledWith([
			ada.id,
			new ProductId("product-ghost"),
		]);
	});

	it("look up each id only once", async () => {
		productRepository.searchByIdsShouldReturn([]);

		await searcher.search(["product-ada", "product-ada"]);

		productRepository.expectSearchByIdsToHaveBeenCalledWith([
			new ProductId("product-ada"),
		]);
	});

	it("return no products without looking them up when no ids are given", async () => {
		expect(await searcher.search([])).toEqual([]);
		productRepository.expectSearchByIdsNotToHaveBeenCalled();
	});
});
