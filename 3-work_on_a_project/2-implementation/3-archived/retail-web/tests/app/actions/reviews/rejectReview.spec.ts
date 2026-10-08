import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";

import { initialActionState } from "@/app/actions/ActionState";
import { rejectReview } from "@/app/actions/reviews/rejectReview";
import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { RetailApiError } from "@/contexts/frontend/retail/api/RetailApiError";

vi.mock("@/contexts/frontend/retail/api/RetailApi", () => ({
	retailApi: { reviewRejecter: { reject: vi.fn() } },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const reject = vi.mocked(retailApi.reviewRejecter.reject);

function formWithReview(id: string): FormData {
	const formData = new FormData();
	formData.set("id", id);

	return formData;
}

describe("rejectReview should", () => {
	it("reject the review and refresh every page", async () => {
		reject.mockResolvedValue();

		expect(
			await rejectReview(initialActionState, formWithReview("review-1")),
		).toEqual(initialActionState);
		expect(reject).toHaveBeenCalledWith("review-1");
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
			reject.mockRejectedValue(
				new RetailApiError(status, type, "failed"),
			);

			expect(
				await rejectReview(
					initialActionState,
					formWithReview("review-1"),
				),
			).toEqual({ error: message });
			expect(revalidatePath).not.toHaveBeenCalled();
		},
	);

	it("reject a form without review id before calling the API", async () => {
		expect(await rejectReview(initialActionState, new FormData())).toEqual({
			error: "Something in the request was not valid. Reload the page and try again.",
		});
		expect(reject).not.toHaveBeenCalled();
	});
});
