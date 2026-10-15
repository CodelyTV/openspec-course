import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";

import { initialActionState } from "@/app/actions/ActionState";
import { approveReview } from "@/app/actions/reviews/approveReview";
import { rejectReview } from "@/app/actions/reviews/rejectReview";
import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { RetailApiError } from "@/contexts/frontend/retail/api/RetailApiError";

vi.mock("@/contexts/frontend/retail/api/RetailApi", () => ({
	retailApi: {
		reviewApprover: { approve: vi.fn() },
		reviewRejecter: { reject: vi.fn() },
	},
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const approve = vi.mocked(retailApi.reviewApprover.approve);
const reject = vi.mocked(retailApi.reviewRejecter.reject);

function formWithReview(reviewId: string): FormData {
	const formData = new FormData();
	formData.set("reviewId", reviewId);

	return formData;
}

const moderations = [
	["approveReview", approveReview, approve],
	["rejectReview", rejectReview, reject],
] as const;

describe.each(moderations)("%s should", (_name, moderate, apiCall) => {
	it("moderate the review and refresh the queue and the product pages", async () => {
		apiCall.mockResolvedValue();

		expect(
			await moderate(initialActionState, formWithReview("review-1")),
		).toEqual({ error: null });
		expect(apiCall).toHaveBeenCalledWith("review-1");
		expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
	});

	it.each([
		["ReviewNotFoundError", 404, "This review no longer exists."],
		[
			"ReviewAlreadyModeratedError",
			409,
			"This review was already moderated. Reload the page to see the current queue.",
		],
	])(
		"explain why the review could not be moderated with %s",
		async (type, status, message) => {
			apiCall.mockRejectedValue(
				new RetailApiError(status, type, "failed"),
			);

			expect(
				await moderate(initialActionState, formWithReview("review-1")),
			).toEqual({ error: message });
			expect(revalidatePath).not.toHaveBeenCalled();
		},
	);

	it("reject a form without review before calling the API", async () => {
		expect(await moderate(initialActionState, new FormData())).toEqual({
			error: "Something in the request was not valid. Reload the page and try again.",
		});
		expect(apiCall).not.toHaveBeenCalled();
	});
});
