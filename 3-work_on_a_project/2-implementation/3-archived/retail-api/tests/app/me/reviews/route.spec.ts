import { describe, expect, it, vi } from "vitest";

import { POST } from "@/app/me/reviews/route";
import type { ReviewSubmitter } from "@/contexts/backend/reviews/application/submit/ReviewSubmitter";
import { InvalidReviewBodyError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewBodyError";
import { InvalidReviewRatingError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewRatingError";
import { InvalidReviewTitleError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewTitleError";
import { ProductNotPurchasedError } from "@/contexts/backend/reviews/domain/errors/ProductNotPurchasedError";
import { ReviewAlreadyExistsError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyExistsError";

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
	productId: "pure-function-tee",
	rating: 4,
	title: "Fits great",
	body: "Soft cotton and a clean drape.",
};

async function postReview(body: string): Promise<Response> {
	return POST(
		new Request("http://localhost/me/reviews", { method: "POST", body }),
		undefined,
	);
}

describe("POST /me/reviews should", () => {
	it("submit the review of the current user and respond 201", async () => {
		const response = await postReview(JSON.stringify(validReview));

		expect(response.status).toBe(201);
		expect(await response.text()).toBe("");
		reviewSubmitter.expectSubmitToHaveBeenCalledWith(validReview);
	});

	it("respond 400 with an InvalidArgumentError when the body is not valid JSON", async () => {
		const response = await postReview("not json");

		expect(response.status).toBe(400);
		expect((await response.json()).error.type).toBe("InvalidArgumentError");
		reviewSubmitter.expectSubmitNotToHaveBeenCalled();
	});

	it.each([
		["a string", "4"],
		["missing", undefined],
		["null", null],
	])(
		"respond 400 with an InvalidArgumentError when rating is %s",
		async (_case, rating) => {
			const response = await postReview(
				JSON.stringify({ ...validReview, rating }),
			);

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({
				error: {
					type: "InvalidArgumentError",
					message: "rating must be a number",
				},
			});
			reviewSubmitter.expectSubmitNotToHaveBeenCalled();
		},
	);

	it("respond 400 with an InvalidArgumentError when title is not a string", async () => {
		const response = await postReview(
			JSON.stringify({ ...validReview, title: 7 }),
		);

		expect(response.status).toBe(400);
		expect((await response.json()).error.type).toBe("InvalidArgumentError");
	});

	it.each([
		[
			"ProductNotPurchasedError",
			403,
			new ProductNotPurchasedError("pure-function-tee"),
		],
		[
			"ReviewAlreadyExistsError",
			409,
			new ReviewAlreadyExistsError("pure-function-tee"),
		],
		["InvalidReviewRatingError", 422, new InvalidReviewRatingError(6)],
		["InvalidReviewTitleError", 422, new InvalidReviewTitleError(100)],
		["InvalidReviewBodyError", 422, new InvalidReviewBodyError(2000)],
	])("respond with a %s and status %d", async (type, status, error) => {
		vi.mocked(reviewSubmitter.submit).mockRejectedValue(error);

		const response = await postReview(JSON.stringify(validReview));

		expect(response.status).toBe(status);
		expect(await response.json()).toEqual({
			error: { type, message: error.message },
		});
	});
});
