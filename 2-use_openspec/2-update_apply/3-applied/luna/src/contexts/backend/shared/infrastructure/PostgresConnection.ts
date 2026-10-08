import { AsyncLocalStorage } from "node:async_hooks";
import postgres from "postgres";

const defaultDatabaseUrl =
	"postgres://retail:retail@localhost:5432/retail_luna";

export function databaseUrl(): string {
	return process.env.DATABASE_URL ?? defaultDatabaseUrl;
}

export class PostgresConnection {
	readonly sql: postgres.Sql;

	private readonly ongoingTransaction =
		new AsyncLocalStorage<postgres.TransactionSql>();

	constructor(url: string = databaseUrl()) {
		this.sql = postgres(url, { idle_timeout: 1, max: 5 });
	}

	currentQueryRunner(): postgres.ISql {
		return this.ongoingTransaction.getStore() ?? this.sql;
	}

	async transaction<T>(work: () => Promise<T>): Promise<T> {
		const isAlreadyInsideATransaction =
			this.ongoingTransaction.getStore() !== undefined;

		if (isAlreadyInsideATransaction) {
			return work();
		}

		return (await this.sql.begin((transactionSql) =>
			this.ongoingTransaction.run(transactionSql, work),
		)) as T;
	}
}
