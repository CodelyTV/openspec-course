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
	productId: "hoodie",
	rating: "4",
	title: "Warm and comfy",
	body: "Thick fabric and a relaxed fit.",
};

describe("submitReview should", () => {
	it("submit the review and refresh the product page", async () => {
		submit.mockResolvedValue();

		expect(
			await submitReview(initialActionState, reviewForm(validFields)),
		).toEqual({ error: null });
		expect(submit).toHaveBeenCalledWith(
			"hoodie",
			4,
			"Warm and comfy",
			"Thick fabric and a relaxed fit.",
		);
		expect(revalidatePath).toHaveBeenCalledWith("/products/[id]", "page");
	});

	it.each([
		["the rating is missing", { ...validFields, rating: "" }],
		["the rating is not a number", { ...validFields, rating: "four" }],
		["the product is missing", { ...validFields, productId: "" }],
	])(
		"reject the form before calling the API when %s",
		async (_case, fields) => {
			expect(
				await submitReview(initialActionState, reviewForm(fields)),
			).toEqual({ error: invalidRequestMessage });
			expect(submit).not.toHaveBeenCalled();
			expect(revalidatePath).not.toHaveBeenCalled();
		},
	);

	it("reject a form without title or body before calling the API", async () => {
		const { title: _title, ...withoutTitle } = validFields;

		expect(
			await submitReview(initialActionState, reviewForm(withoutTitle)),
		).toEqual({ error: invalidRequestMessage });
		expect(submit).not.toHaveBeenCalled();
	});

	it.each([
		[
			"InvalidReviewRatingError",
			422,
			"Choose a rating between 1 and 5 stars.",
		],
		[
			"InvalidReviewTitleError",
			422,
			"The title is required and can be at most 100 characters long.",
		],
		[
			"InvalidReviewBodyError",
			422,
			"The review text is required and can be at most 2000 characters long.",
		],
		[
			"ProductNotPurchasedError",
			403,
			"Only customers who bought this product can review it.",
		],
		[
			"ReviewAlreadyExistsError",
			409,
			"You have already reviewed this product.",
		],
		[
			"ReviewedProductNotFoundError",
			404,
			"This product is no longer available.",
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
});
