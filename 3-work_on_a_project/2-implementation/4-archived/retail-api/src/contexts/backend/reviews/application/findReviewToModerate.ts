import { ReviewNotFoundError } from "../domain/errors/ReviewNotFoundError";
import type { Review } from "../domain/Review";
import { ReviewId } from "../domain/ReviewId";
import type { ReviewRepository } from "../domain/ReviewRepository";

export async function findReviewToModerate(
	repository: ReviewRepository,
	id: string,
): Promise<Review> {
	const review = await repository.search(new ReviewId(id));

	if (review === null) {
		throw new ReviewNotFoundError(id);
	}

	return review;
}
