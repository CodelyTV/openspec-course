import { describe, expect, it } from "vitest";

import { RelatedProductsFinder } from "@/contexts/backend/products/application/find-related/RelatedProductsFinder";
import { toProductResponse } from "@/contexts/backend/products/application/ProductResponse";
import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";

describe("RelatedProductsFinder should", () => {
	const repository = Mock.create<ProductRepository>();
	const finder = new RelatedProductsFinder(repository);

	it("return up to four products related to the given one", async () => {
		const product = ProductMother.create();
		const related = [ProductMother.create(), ProductMother.create()];
		repository.searchShouldReturn(product);
		repository.searchOthersSameCollectionFirstShouldReturn(related);

		expect(await finder.find(product.id.value)).toEqual(
			related.map(toProductResponse),
		);
		repository.expectSearchOthersSameCollectionFirstToHaveBeenCalledWith(
			product,
			4,
		);
	});

	it("fail when the product does not exist", async () => {
		repository.searchShouldReturn(null);

		await expect(finder.find("ghost")).rejects.toBeInstanceOf(
			ProductNotFoundError,
		);
		repository.expectSearchOthersSameCollectionFirstNotToHaveBeenCalled();
	});
});
