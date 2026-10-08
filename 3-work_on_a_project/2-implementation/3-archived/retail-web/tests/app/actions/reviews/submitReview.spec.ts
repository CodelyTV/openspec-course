import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";

import { initialActionState } from "@/app/actions/ActionState";
import { submitReview } from "@/app/actions/reviews/submitReview";
import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { RetailApiError } from "@/contexts/frontend/retail/api/RetailApiError";

vi.mock("@/contexts/frontend/retail/api/RetailApi", () => ({
	retailApi: { reviewSubmitter: { submit: vi.fn() } },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const submit = vi.mocked(retailApi.reviewSubmitter.submit);

const invalidRequestMessage =
	"Something in the request was not valid. Reload the page and try again.";

function reviewForm(fields: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) {
		formData.set(name, value);
	}

	return formData;
}

const validFields = {
	productId: "pure-function-tee",
	rating: "4",
	title: "Fits great",
	body: "Soft cotton.",
};

describe("submitReview should", () => {
	it("submit the review and refresh the product page", async () => {
		submit.mockResolvedValue();

		expect(
			await submitReview(initialActionState, reviewForm(validFields)),
		).toEqual(initialActionState);
		expect(submit).toHaveBeenCalledWith({
			productId: "pure-function-tee",
			rating: 4,
			title: "Fits great",
			body: "Soft cotton.",
		});
		expect(revalidatePath).toHaveBeenCalledWith(
			"/products/pure-function-tee",
		);
	});

	it.each([
		[
			"ProductNotPurchasedError",
			403,
			"Only customers who bought this product can review it.",
		],
		["ReviewAlreadyExistsError", 409, "You already reviewed this product."],
		[
			"InvalidReviewRatingError",
			422,
			"The rating must be between 1 and 5 stars.",
		],
		[
			"InvalidReviewTitleError",
			422,
			"The title must have between 1 and 100 characters.",
		],
		[
			"InvalidReviewBodyError",
			422,
			"The review must have between 1 and 2000 characters.",
		],
	])(
		"explain why the review was rejected with %s",
		async (type, status, message) => {
			submit.mockRejectedValue(
				new RetailApiError(status, type, "rejected"),
			);

			expect(
				await submitReview(initialActionState, reviewForm(validFields)),
			).toEqual({ error: message });
			expect(revalidatePath).not.toHaveBeenCalled();
		},
	);

	it.each(["productId", "rating"] as const)(
		"reject a form without %s before calling the API",
		async (missingField) => {
			const fieldsWithoutTheMissingOne = Object.fromEntries(
				Object.entries(validFields).filter(
					([name]) => name !== missingField,
				),
			);

			expect(
				await submitReview(
					initialActionState,
					reviewForm(fieldsWithoutTheMissingOne),
				),
			).toEqual({ error: invalidRequestMessage });
			expect(submit).not.toHaveBeenCalled();
		},
	);
});
