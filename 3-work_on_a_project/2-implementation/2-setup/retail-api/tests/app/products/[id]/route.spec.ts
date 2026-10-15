import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/products/[id]/route";
import type { ProductFinder } from "@/contexts/backend/products/application/find/ProductFinder";
import { toProductResponse } from "@/contexts/backend/products/application/ProductResponse";

import { ProductMother } from "../../../backend/products/domain/ProductMother";
import { Mock } from "../../../shared/Mock";

const productFinder = Mock.create<ProductFinder>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get productFinder(): ProductFinder {
			return productFinder;
		},
	},
}));

async function getProduct(id: string): Promise<Response> {
	return GET(new Request(`http://localhost/products/${id}`), {
		params: Promise.resolve({ id }),
	});
}

describe("GET /products/{id} should", () => {
	it("respond with the product", async () => {
		const product = toProductResponse(ProductMother.create());
		productFinder.findShouldReturn(product);

		const response = await getProduct(product.id);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual(product);
		productFinder.expectFindToHaveBeenCalledWith(product.id);
	});

	it("respond 404 with a ProductNotFoundError when the product does not exist", async () => {
		productFinder.findShouldReturn(null);

		const response = await getProduct("missing");

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({
			error: {
				type: "ProductNotFoundError",
				message: "Product missing not found",
			},
		});
	});
});
