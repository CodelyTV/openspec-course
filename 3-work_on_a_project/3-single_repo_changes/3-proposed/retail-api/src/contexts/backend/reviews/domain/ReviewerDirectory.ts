import type { UserId } from "@/contexts/shared/domain/UserId";

export class ReviewerNames {
	constructor(
		private readonly nameByReviewerId: ReadonlyMap<string, string>,
	) {}

	nameOf(reviewerId: UserId): string {
		return this.nameByReviewerId.get(reviewerId.value) ?? reviewerId.value;
	}
}

export abstract class ReviewerDirectory {
	abstract namesOf(reviewerIds: UserId[]): Promise<ReviewerNames>;
}
