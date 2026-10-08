import { InvalidReviewTitleError } from "./errors/InvalidReviewTitleError";

export const maxReviewTitleLength = 100;

export class ReviewTitle {
	readonly value: string;

	constructor(title: string) {
		this.value = title.trim();

		const hasAllowedLength =
			this.value.length > 0 && this.value.length <= maxReviewTitleLength;

		if (!hasAllowedLength) {
			throw new InvalidReviewTitleError(maxReviewTitleLength);
		}
	}
}
