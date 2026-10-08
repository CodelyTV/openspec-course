import { InvalidReviewBodyError } from "./errors/InvalidReviewBodyError";

export const maxReviewBodyLength = 2000;

export class ReviewBody {
	readonly value: string;

	constructor(body: string) {
		this.value = body.trim();

		const hasAllowedLength =
			this.value.length > 0 && this.value.length <= maxReviewBodyLength;

		if (!hasAllowedLength) {
			throw new InvalidReviewBodyError(maxReviewBodyLength);
		}
	}
}
