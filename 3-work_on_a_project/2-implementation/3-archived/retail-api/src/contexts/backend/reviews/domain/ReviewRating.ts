import { InvalidReviewRatingError } from "./errors/InvalidReviewRatingError";

export const minReviewRating = 1;
export const maxReviewRating = 5;

export class ReviewRating {
	constructor(readonly value: number) {
		const isWholeNumberOfStarsInRange =
			Number.isInteger(value) &&
			value >= minReviewRating &&
			value <= maxReviewRating;

		if (!isWholeNumberOfStarsInRange) {
			throw new InvalidReviewRatingError(value);
		}
	}
}
