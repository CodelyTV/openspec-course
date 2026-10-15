import { describe, expect, it, vi } from "vitest";

import { POST } from "@/app/reviews/[id]/approval/route";
import type { ReviewApprover } from "@/contexts/backend/reviews/application/approve/ReviewApprover";
import { ReviewAlreadyModeratedError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyModeratedError";
import { ReviewNotFoundError } from "@/contexts/backend/reviews/domain/errors/ReviewNotFoundError";

import { Mock } from "../../../../shared/Mock";

const reviewApprover = Mock.create<ReviewApprover>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get reviewApprover(): ReviewApprover {
			return reviewApprover;
		},
	},
}));

async function approveReview(id: string): Promise<Response> {
	return POST(
		new Request(`http://localhost/reviews/${id}/approval`, {
			method: "POST",
		}),
		{ params: Promise.resolve({ id }) },
	);
}

describe("POST /reviews/{id}/approval should", () => {
	it("approve the review and respond 204", async () => {
		const response = await approveReview("review-1");

		expect(response.status).toBe(204);
		reviewApprover.expectApproveToHaveBeenCalledWith("review-1");
	});

	it.each([
		[new ReviewNotFoundError("review-1"), 404],
		[new ReviewAlreadyModeratedError("review-1"), 409],
	])("respond with the status of a %s", async (error, status) => {
		vi.mocked(reviewApprover.approve).mockRejectedValue(error);

		const response = await approveReview("review-1");

		expect(response.status).toBe(status);
		expect(await response.json()).toEqual({
			error: { type: error.name, message: error.message },
		});
	});
});
