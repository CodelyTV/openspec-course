import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";

import { initialActionState } from "@/app/actions/ActionState";
import { approveReview } from "@/app/actions/reviews/approveReview";
import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { RetailApiError } from "@/contexts/frontend/retail/api/RetailApiError";

vi.mock("@/contexts/frontend/retail/api/RetailApi", () => ({
	retailApi: { reviewApprover: { approve: vi.fn() } },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const approve = vi.mocked(retailApi.reviewApprover.approve);

function formWithReview(id: string): FormData {
	const formData = new FormData();
	formData.set("id", id);

	return formData;
}

describe("approveReview should", () => {
	it("approve the review and refresh every page", async () => {
		approve.mockResolvedValue();

		expect(
			await approveReview(initialActionState, formWithReview("review-1")),
		).toEqual(initialActionState);
		expect(approve).toHaveBeenCalledWith("review-1");
		expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
	});

	it.each([
		[
			"ReviewAlreadyModeratedError",
			409,
			"This review was already moderated.",
		],
		["ReviewNotFoundError", 404, "This review no longer exists."],
	])(
		"explain why the review could not be moderated with %s",
		async (type, status, message) => {
			approve.mockRejectedValue(
				new RetailApiError(status, type, "failed"),
			);

			expect(
				await approveReview(
					initialActionState,
					formWithReview("review-1"),
				),
			).toEqual({ error: message });
			expect(revalidatePath).not.toHaveBeenCalled();
		},
	);

	it("reject a form without review id before calling the API", async () => {
		expect(await approveReview(initialActionState, new FormData())).toEqual(
			{
				error: "Something in the request was not valid. Reload the page and try again.",
			},
		);
		expect(approve).not.toHaveBeenCalled();
	});
});
