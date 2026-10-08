import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidReviewRatingError extends CodelyError {
	constructor(rating: number) {
		super(
			`A review rating must be a whole number of stars from 1 to 5, got ${rating}`,
		);
	}
}
