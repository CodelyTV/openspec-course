import { describe, expect, it, vi } from "vitest";

import { POST } from "@/app/me/reviews/route";
import type { ReviewSubmitter } from "@/contexts/backend/reviews/application/submit/ReviewSubmitter";
import { InvalidReviewBodyError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewBodyError";
import { InvalidReviewRatingError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewRatingError";
import { InvalidReviewTitleError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewTitleError";
import { ProductNotPurchasedError } from "@/contexts/backend/reviews/domain/errors/ProductNotPurchasedError";
import { ReviewAlreadyExistsError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyExistsError";
import { ReviewedProductNotFoundError } from "@/contexts/backend/reviews/domain/errors/ReviewedProductNotFoundError";

import { Mock } from "../../../shared/Mock";

const reviewSubmitter = Mock.create<ReviewSubmitter>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get reviewSubmitter(): ReviewSubmitter {
			return reviewSubmitter;
		},
	},
}));

const validReview = {
	productId: "hoodie",
	rating: 4,
	title: "Warm and comfy",
	body: "Thick fabric and a relaxed fit.",
};

async function postReview(body: string): Promise<Response> {
	return POST(
		new Request("http://localhost/me/reviews", { method: "POST", body }),
		undefined,
	);
}

describe("POST /me/reviews should", () => {
	it("submit the review of the current customer and respond 201", async () => {
		const response = await postReview(JSON.stringify(validReview));

		expect(response.status).toBe(201);
		reviewSubmitter.expectSubmitToHaveBeenCalledWith(
			"hoodie",
			4,
			"Warm and comfy",
			"Thick fabric and a relaxed fit.",
		);
	});

	it.each([
		["the body is not valid JSON", "not json"],
		[
			"the rating is not a number",
			JSON.stringify({ ...validReview, rating: "4" }),
		],
		[
			"the productId is missing",
			JSON.stringify({ ...validReview, productId: undefined }),
		],
		[
			"the title is not a string",
			JSON.stringify({ ...validReview, title: 42 }),
		],
		[
			"the body is missing",
			JSON.stringify({ ...validReview, body: undefined }),
		],
	])(
		"respond 400 with an InvalidArgumentError when %s",
		async (_case, body) => {
			const response = await postReview(body);

			expect(response.status).toBe(400);
			expect((await response.json()).error.type).toBe(
				"InvalidArgumentError",
			);
			reviewSubmitter.expectSubmitNotToHaveBeenCalled();
		},
	);

	it.each([
		[new ProductNotPurchasedError("hoodie"), 403],
		[new ReviewedProductNotFoundError("hoodie"), 404],
		[new ReviewAlreadyExistsError("hoodie"), 409],
		[new InvalidReviewRatingError(6, 1, 5), 422],
		[new InvalidReviewTitleError(100), 422],
		[new InvalidReviewBodyError(2000), 422],
	])("respond with the status of a %s", async (error, status) => {
		vi.mocked(reviewSubmitter.submit).mockRejectedValue(error);

		const response = await postReview(JSON.stringify(validReview));

		expect(response.status).toBe(status);
		expect(await response.json()).toEqual({
			error: { type: error.name, message: error.message },
		});
	});
});
