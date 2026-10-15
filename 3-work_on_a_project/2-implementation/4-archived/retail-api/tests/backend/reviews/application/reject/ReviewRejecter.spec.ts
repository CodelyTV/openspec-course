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
		const primitives = ReviewMother.createPrimitives({ status: "pending" });
		repository.searchShouldReturn(ReviewMother.create(primitives));

		await rejecter.reject(primitives.id);

		repository.expectSearchToHaveBeenCalledWith(
			new ReviewId(primitives.id),
		);
		repository.expectSaveToHaveBeenCalledWith(
			ReviewMother.create({ ...primitives, status: "rejected" }),
		);
	});

	it("fail with a ReviewNotFoundError when the review does not exist", async () => {
		repository.searchShouldReturn(null);

		await expect(rejecter.reject("ghost")).rejects.toBeInstanceOf(
			ReviewNotFoundError,
		);
		repository.expectSaveNotToHaveBeenCalled();
	});

	it.each([
		["approved", ReviewMother.approved],
		["rejected", ReviewMother.rejected],
	])(
		"fail with a ReviewAlreadyModeratedError when the review was already %s",
		async (_status, moderatedReview) => {
			const review = moderatedReview();
			repository.searchShouldReturn(review);

			await expect(
				rejecter.reject(review.id.value),
			).rejects.toBeInstanceOf(ReviewAlreadyModeratedError);
			repository.expectSaveNotToHaveBeenCalled();
		},
	);
});
