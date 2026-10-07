import type { UserId } from "@/contexts/shared/domain/UserId";

import type { User } from "./User";

export abstract class UserRepository {
	abstract search(id: UserId): Promise<User | null>;

	abstract searchAll(): Promise<User[]>;

	abstract searchByIds(ids: UserId[]): Promise<User[]>;
}
