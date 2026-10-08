import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/reviews/pending/route";
import type { PendingReviewsLister } from "@/contexts/backend/reviews/application/list-pending/PendingReviewsLister";
import { toReviewResponse } from "@/contexts/backend/reviews/application/ReviewResponse";

import { ReviewMother } from "../../../backend/reviews/domain/ReviewMother";
import { Mock } from "../../../shared/Mock";

const pendingReviewsLister = Mock.create<PendingReviewsLister>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get pendingReviewsLister(): PendingReviewsLister {
			return pendingReviewsLister;
		},
	},
}));

describe("GET /reviews/pending should", () => {
	it("respond with the pending reviews", async () => {
		const review = ReviewMother.pending();
		const pendingReviews = [
			{
				...toReviewResponse(review),
				productId: review.productId.value,
				productName: review.productName,
			},
		];
		pendingReviewsLister.listShouldReturn(pendingReviews);

		const response = await GET(
			new Request("http://localhost/reviews/pending"),
			undefined,
		);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual(pendingReviews);
	});
});
