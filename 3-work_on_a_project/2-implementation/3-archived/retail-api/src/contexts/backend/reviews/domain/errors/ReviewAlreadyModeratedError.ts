import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class ReviewAlreadyModeratedError extends CodelyError {
	constructor(reviewId: string, status: string) {
		super(`Review ${reviewId} was already moderated (${status})`);
	}
}
