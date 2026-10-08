import { describe, expect, it } from "vitest";

import { ReviewApprover } from "@/contexts/backend/reviews/application/approve/ReviewApprover";
import { ReviewAlreadyModeratedError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyModeratedError";
import { ReviewNotFoundError } from "@/contexts/backend/reviews/domain/errors/ReviewNotFoundError";
import { ReviewId } from "@/contexts/backend/reviews/domain/ReviewId";
import type { ReviewRepository } from "@/contexts/backend/reviews/domain/ReviewRepository";

import { Mock } from "../../../../shared/Mock";
import { ReviewMother } from "../../domain/ReviewMother";

describe("ReviewApprover should", () => {
	const repository = Mock.create<ReviewRepository>();
	const approver = new ReviewApprover(repository);

	it("approve a pending review", async () => {
		const review = ReviewMother.pending();
		repository.searchShouldReturn(review);

		await approver.approve(review.id.value);

		repository.expectSearchToHaveBeenCalledWith(review.id);
		repository.expectSaveToHaveBeenCalledWith(
			ReviewMother.approved(review.toPrimitives()),
		);
	});

	it.each([
		["approved", ReviewMother.approved],
		["rejected", ReviewMother.rejected],
	])(
		"not approve a review that was already %s",
		async (_status, moderatedReview) => {
			const review = moderatedReview();
			repository.searchShouldReturn(review);

			await expect(
				approver.approve(review.id.value),
			).rejects.toBeInstanceOf(ReviewAlreadyModeratedError);
			repository.expectSaveNotToHaveBeenCalled();
		},
	);

	it("not approve a review that does not exist", async () => {
		repository.searchShouldReturn(null);

		await expect(approver.approve("ghost")).rejects.toBeInstanceOf(
			ReviewNotFoundError,
		);
		repository.expectSearchToHaveBeenCalledWith(new ReviewId("ghost"));
		repository.expectSaveNotToHaveBeenCalled();
	});
});
