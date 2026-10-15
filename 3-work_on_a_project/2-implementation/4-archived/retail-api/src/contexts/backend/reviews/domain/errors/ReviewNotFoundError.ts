import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class ReviewNotFoundError extends CodelyError {
	constructor(reviewId: string) {
		super(`Review ${reviewId} not found`);
	}
}
