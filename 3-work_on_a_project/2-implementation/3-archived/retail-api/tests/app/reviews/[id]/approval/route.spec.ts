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

async function postApproval(id: string): Promise<Response> {
	return POST(
		new Request(`http://localhost/reviews/${id}/approval`, {
			method: "POST",
		}),
		{ params: Promise.resolve({ id }) },
	);
}

describe("POST /reviews/{id}/approval should", () => {
	it("approve the review and respond 204", async () => {
		const response = await postApproval("review-1");

		expect(response.status).toBe(204);
		reviewApprover.expectApproveToHaveBeenCalledWith("review-1");
	});

	it("respond 404 with a ReviewNotFoundError when the review does not exist", async () => {
		vi.mocked(reviewApprover.approve).mockRejectedValue(
			new ReviewNotFoundError("ghost"),
		);

		const response = await postApproval("ghost");

		expect(response.status).toBe(404);
		expect((await response.json()).error.type).toBe("ReviewNotFoundError");
	});

	it("respond 409 with a ReviewAlreadyModeratedError when the review was already moderated", async () => {
		vi.mocked(reviewApprover.approve).mockRejectedValue(
			new ReviewAlreadyModeratedError("review-1", "rejected"),
		);

		const response = await postApproval("review-1");

		expect(response.status).toBe(409);
		expect((await response.json()).error.type).toBe(
			"ReviewAlreadyModeratedError",
		);
	});
});
