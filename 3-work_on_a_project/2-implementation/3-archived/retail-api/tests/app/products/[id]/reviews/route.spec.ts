import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/products/[id]/reviews/route";
import type { ProductReviewsFinder } from "@/contexts/backend/reviews/application/find-for-product/ProductReviewsFinder";
import { toReviewResponse } from "@/contexts/backend/reviews/application/ReviewResponse";

import { ReviewMother } from "../../../../backend/reviews/domain/ReviewMother";
import { Mock } from "../../../../shared/Mock";

const productReviewsFinder = Mock.create<ProductReviewsFinder>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get productReviewsFinder(): ProductReviewsFinder {
			return productReviewsFinder;
		},
	},
}));

async function getProductReviews(id: string): Promise<Response> {
	return GET(new Request(`http://localhost/products/${id}/reviews`), {
		params: Promise.resolve({ id }),
	});
}

describe("GET /products/{id}/reviews should", () => {
	it("respond with the approved reviews of the product and their average rating", async () => {
		const productReviews = {
			averageRating: 4.5,
			reviewCount: 2,
			reviews: [
				toReviewResponse(ReviewMother.approved({ rating: 5 })),
				toReviewResponse(ReviewMother.approved({ rating: 4 })),
			],
		};
		productReviewsFinder.findShouldReturn(productReviews);

		const response = await getProductReviews("pure-function-tee");

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual(productReviews);
		productReviewsFinder.expectFindToHaveBeenCalledWith(
			"pure-function-tee",
		);
	});

	it("respond with no average and no reviews when the product has none", async () => {
		productReviewsFinder.findShouldReturn({
			averageRating: null,
			reviewCount: 0,
			reviews: [],
		});

		const response = await getProductReviews("unknown");

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			averageRating: null,
			reviewCount: 0,
			reviews: [],
		});
	});
});
