import type { UsersByIdsSearcher } from "@/contexts/backend/users/application/search-by-ids/UsersByIdsSearcher";
import type { UserId } from "@/contexts/shared/domain/UserId";

import { ReviewAuthors } from "../domain/ReviewAuthors";

export class UsersReviewAuthors extends ReviewAuthors {
	constructor(private readonly usersByIdsSearcher: UsersByIdsSearcher) {
		super();
	}

	async nameOf(userId: UserId): Promise<string> {
		const authors = await this.usersByIdsSearcher.search([userId.value]);

		return authors.at(0)?.name ?? userId.value;
	}
}
