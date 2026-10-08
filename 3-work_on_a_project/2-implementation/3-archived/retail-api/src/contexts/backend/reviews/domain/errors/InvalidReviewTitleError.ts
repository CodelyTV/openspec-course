import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidReviewTitleError extends CodelyError {
	constructor(maxLength: number) {
		super(`A review title must have between 1 and ${maxLength} characters`);
	}
}
