import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/reviews/pending/route";
import type { PendingReviewsLister } from "@/contexts/backend/reviews/application/list-pending/PendingReviewsLister";

import { PendingReviewResponseMother } from "../../../backend/reviews/application/list-pending/PendingReviewResponseMother";
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
	it("respond with the reviews awaiting moderation", async () => {
		const pending = [
			PendingReviewResponseMother.create(),
			PendingReviewResponseMother.create(),
		];
		pendingReviewsLister.listShouldReturn(pending);

		const response = await GET(
			new Request("http://localhost/reviews/pending"),
			undefined,
		);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual(pending);
	});
});
