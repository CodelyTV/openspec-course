import { UnitOfWork } from "@/contexts/shared/domain/UnitOfWork";

import type { PostgresConnection } from "./PostgresConnection";

export class PostgresUnitOfWork extends UnitOfWork {
	constructor(private readonly connection: PostgresConnection) {
		super();
	}

	async run<T>(work: () => Promise<T>): Promise<T> {
		return this.connection.transaction(work);
	}
}
