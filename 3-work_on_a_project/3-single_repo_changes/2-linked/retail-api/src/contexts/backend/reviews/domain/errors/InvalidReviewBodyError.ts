import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidReviewBodyError extends CodelyError {
	constructor(maxLength: number) {
		super(
			`A review needs a non-blank text of at most ${maxLength} characters`,
		);
	}
}
