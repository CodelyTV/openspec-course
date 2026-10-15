import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidReviewRatingError extends CodelyError {
	constructor(rating: number, min: number, max: number) {
		super(
			`A review rating must be a whole number between ${min} and ${max} stars, got ${rating}`,
		);
	}
}
