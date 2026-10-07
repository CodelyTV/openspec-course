import type postgres from "postgres";

import type { PostgresConnection } from "./PostgresConnection";

export abstract class PostgresRepository {
	constructor(private readonly connection: PostgresConnection) {}

	protected get sql(): postgres.ISql {
		return this.connection.currentQueryRunner();
	}

	protected async transaction<T>(work: () => Promise<T>): Promise<T> {
		return this.connection.transaction(work);
	}
}
