import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidReviewTitleError extends CodelyError {
	constructor(maxLength: number) {
		super(
			`A review needs a non-blank title of at most ${maxLength} characters`,
		);
	}
}
