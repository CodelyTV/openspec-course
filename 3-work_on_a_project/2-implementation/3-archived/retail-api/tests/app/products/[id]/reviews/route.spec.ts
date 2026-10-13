import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/products/[id]/reviews/route";
import type { ProductReviewsGetter } from "@/contexts/backend/reviews/application/get-product-reviews/ProductReviewsGetter";

import { ProductReviewsResponseMother } from "../../../../backend/reviews/application/get-product-reviews/ProductReviewsResponseMother";
import { Mock } from "../../../../shared/Mock";

const productReviewsGetter = Mock.create<ProductReviewsGetter>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get productReviewsGetter(): ProductReviewsGetter {
			return productReviewsGetter;
		},
	},
}));

describe("GET /products/{id}/reviews should", () => {
	it("respond with the approved reviews of the product and their summary", async () => {
		const reviews = ProductReviewsResponseMother.create();
		productReviewsGetter.getShouldReturn(reviews);

		const response = await GET(
			new Request("http://localhost/products/hoodie/reviews"),
			{ params: Promise.resolve({ id: "hoodie" }) },
		);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual(reviews);
		productReviewsGetter.expectGetToHaveBeenCalledWith("hoodie");
	});
});
