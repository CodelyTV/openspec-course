import { describe, expect, it } from "vitest";

import { VariantsSearcher } from "@/contexts/backend/products/application/search-variants/VariantsSearcher";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import { EmptyStringValueObjectError } from "@/contexts/shared/domain/errors/EmptyStringValueObjectError";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("VariantsSearcher should", () => {
	const repository = Mock.create<ProductRepository>();
	const searcher = new VariantsSearcher(repository);

	it("return the requested variants with the name and price of their product", async () => {
		const hoodie = ProductMother.create({
			id: "hoodie",
			name: "Hoodie",
			price: { amount: 80, currency: "EUR" },
			variants: [
				ProductVariantMother.createPrimitives({
					id: "hoodie-l",
					color: "Ecru",
					size: "L",
					onlineStock: 4,
				}),
				ProductVariantMother.createPrimitives({ id: "hoodie-s" }),
			],
		});
		repository.searchByVariantIdsShouldReturn([hoodie]);

		expect(await searcher.search(["hoodie-l"])).toEqual([
			{
				productId: "hoodie",
				productName: "Hoodie",
				variantId: "hoodie-l",
				color: "Ecru",
				size: "L",
				price: { amount: 80, currency: "EUR" },
				onlineStock: 4,
			},
		]);
		repository.expectSearchByVariantIdsToHaveBeenCalledWith([
			new VariantId("hoodie-l"),
		]);
	});

	it("leave out the variants that do not exist", async () => {
		repository.searchByVariantIdsShouldReturn([]);

		expect(await searcher.search(["ghost"])).toEqual([]);
	});

	it("fail for a blank variant id without looking it up", async () => {
		await expect(searcher.search([" "])).rejects.toBeInstanceOf(
			EmptyStringValueObjectError,
		);
		repository.expectSearchByVariantIdsNotToHaveBeenCalled();
	});
});
