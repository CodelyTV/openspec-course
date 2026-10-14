import type { UsersByIdsSearcher } from "@/contexts/backend/users/application/search-by-ids/UsersByIdsSearcher";
import type { UserId } from "@/contexts/shared/domain/UserId";

import { ReviewerDirectory, ReviewerNames } from "../domain/ReviewerDirectory";

export class UsersReviewerDirectory extends ReviewerDirectory {
	constructor(private readonly usersByIdsSearcher: UsersByIdsSearcher) {
		super();
	}

	async namesOf(reviewerIds: UserId[]): Promise<ReviewerNames> {
		const users = await this.usersByIdsSearcher.search(
			reviewerIds.map((reviewerId) => reviewerId.value),
		);

		return new ReviewerNames(
			new Map(users.map((user) => [user.id, user.name])),
		);
	}
}
