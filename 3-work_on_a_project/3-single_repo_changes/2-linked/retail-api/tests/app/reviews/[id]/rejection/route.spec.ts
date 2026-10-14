import { describe, expect, it, vi } from "vitest";

import { POST } from "@/app/reviews/[id]/rejection/route";
import type { ReviewRejecter } from "@/contexts/backend/reviews/application/reject/ReviewRejecter";
import { ReviewAlreadyModeratedError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyModeratedError";
import { ReviewNotFoundError } from "@/contexts/backend/reviews/domain/errors/ReviewNotFoundError";

import { Mock } from "../../../../shared/Mock";

const reviewRejecter = Mock.create<ReviewRejecter>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get reviewRejecter(): ReviewRejecter {
			return reviewRejecter;
		},
	},
}));

async function rejectReview(id: string): Promise<Response> {
	return POST(
		new Request(`http://localhost/reviews/${id}/rejection`, {
			method: "POST",
		}),
		{ params: Promise.resolve({ id }) },
	);
}

describe("POST /reviews/{id}/rejection should", () => {
	it("reject the review and respond 204", async () => {
		const response = await rejectReview("review-1");

		expect(response.status).toBe(204);
		reviewRejecter.expectRejectToHaveBeenCalledWith("review-1");
	});

	it.each([
		[new ReviewNotFoundError("review-1"), 404],
		[new ReviewAlreadyModeratedError("review-1"), 409],
	])("respond with the status of a %s", async (error, status) => {
		vi.mocked(reviewRejecter.reject).mockRejectedValue(error);

		const response = await rejectReview("review-1");

		expect(response.status).toBe(status);
		expect(await response.json()).toEqual({
			error: { type: error.name, message: error.message },
		});
	});
});
