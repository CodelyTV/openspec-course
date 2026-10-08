import { describe, expect, it } from "vitest";

import { ReviewRejecter } from "@/contexts/backend/reviews/application/reject/ReviewRejecter";
import { ReviewAlreadyModeratedError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyModeratedError";
import { ReviewNotFoundError } from "@/contexts/backend/reviews/domain/errors/ReviewNotFoundError";
import { ReviewId } from "@/contexts/backend/reviews/domain/ReviewId";
import type { ReviewRepository } from "@/contexts/backend/reviews/domain/ReviewRepository";

import { Mock } from "../../../../shared/Mock";
import { ReviewMother } from "../../domain/ReviewMother";

describe("ReviewRejecter should", () => {
	const repository = Mock.create<ReviewRepository>();
	const rejecter = new ReviewRejecter(repository);

	it("reject a pending review", async () => {
		const review = ReviewMother.pending();
		repository.searchShouldReturn(review);

		await rejecter.reject(review.id.value);

		repository.expectSearchToHaveBeenCalledWith(review.id);
		repository.expectSaveToHaveBeenCalledWith(
			ReviewMother.rejected(review.toPrimitives()),
		);
	});

	it.each([
		["approved", ReviewMother.approved],
		["rejected", ReviewMother.rejected],
	])(
		"not reject a review that was already %s",
		async (_status, moderatedReview) => {
			const review = moderatedReview();
			repository.searchShouldReturn(review);

			await expect(
				rejecter.reject(review.id.value),
			).rejects.toBeInstanceOf(ReviewAlreadyModeratedError);
			repository.expectSaveNotToHaveBeenCalled();
		},
	);

	it("not reject a review that does not exist", async () => {
		repository.searchShouldReturn(null);

		await expect(rejecter.reject("ghost")).rejects.toBeInstanceOf(
			ReviewNotFoundError,
		);
		repository.expectSearchToHaveBeenCalledWith(new ReviewId("ghost"));
		repository.expectSaveNotToHaveBeenCalled();
	});
});
