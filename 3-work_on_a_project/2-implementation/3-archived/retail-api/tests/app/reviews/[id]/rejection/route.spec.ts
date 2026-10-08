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

async function postRejection(id: string): Promise<Response> {
	return POST(
		new Request(`http://localhost/reviews/${id}/rejection`, {
			method: "POST",
		}),
		{ params: Promise.resolve({ id }) },
	);
}

describe("POST /reviews/{id}/rejection should", () => {
	it("reject the review and respond 204", async () => {
		const response = await postRejection("review-1");

		expect(response.status).toBe(204);
		reviewRejecter.expectRejectToHaveBeenCalledWith("review-1");
	});

	it("respond 404 with a ReviewNotFoundError when the review does not exist", async () => {
		vi.mocked(reviewRejecter.reject).mockRejectedValue(
			new ReviewNotFoundError("ghost"),
		);

		const response = await postRejection("ghost");

		expect(response.status).toBe(404);
		expect((await response.json()).error.type).toBe("ReviewNotFoundError");
	});

	it("respond 409 with a ReviewAlreadyModeratedError when the review was already moderated", async () => {
		vi.mocked(reviewRejecter.reject).mockRejectedValue(
			new ReviewAlreadyModeratedError("review-1", "approved"),
		);

		const response = await postRejection("review-1");

		expect(response.status).toBe(409);
		expect((await response.json()).error.type).toBe(
			"ReviewAlreadyModeratedError",
		);
	});
});
