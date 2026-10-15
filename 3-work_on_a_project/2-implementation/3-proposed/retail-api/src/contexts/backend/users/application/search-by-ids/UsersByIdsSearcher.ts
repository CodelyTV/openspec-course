import { UserId } from "@/contexts/shared/domain/UserId";

import type { UserPrimitives } from "../../domain/User";
import type { UserRepository } from "../../domain/UserRepository";

export type UserResponse = UserPrimitives;

export class UsersByIdsSearcher {
	constructor(private readonly repository: UserRepository) {}

	async search(ids: string[]): Promise<UserResponse[]> {
		const distinctIds = [...new Set(ids)];

		if (distinctIds.length === 0) {
			return [];
		}

		const users = await this.repository.searchByIds(
			distinctIds.map((id) => new UserId(id)),
		);

		return users.map((user) => user.toPrimitives());
	}
}
