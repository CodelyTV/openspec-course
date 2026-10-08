import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidReviewBodyError extends CodelyError {
	constructor(maxLength: number) {
		super(`A review body must have between 1 and ${maxLength} characters`);
	}
}
