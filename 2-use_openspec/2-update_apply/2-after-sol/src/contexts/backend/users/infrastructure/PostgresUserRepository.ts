import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { UserId } from "@/contexts/shared/domain/UserId";

import { User } from "../domain/User";
import type { UserRepository } from "../domain/UserRepository";

type UserRow = {
	id: string;
	name: string;
	email: string;
};

export class PostgresUserRepository
	extends PostgresRepository
	implements UserRepository
{
	async search(id: UserId): Promise<User | null> {
		const row = (
			await this.sql<UserRow[]>`
				select id, name, email
				from users
				where id = ${id.value}
			`
		).at(0);

		return row ? User.fromPrimitives(row) : null;
	}

	async searchAll(): Promise<User[]> {
		const rows = await this.sql<
			UserRow[]
		>`select id, name, email from users`;

		return rows.map((row) => User.fromPrimitives(row));
	}

	async searchByIds(ids: UserId[]): Promise<User[]> {
		const rows = await this.sql<UserRow[]>`
			select id, name, email
			from users
			where id = any(${ids.map((id) => id.value)})
		`;

		return rows.map((row) => User.fromPrimitives(row));
	}
}
