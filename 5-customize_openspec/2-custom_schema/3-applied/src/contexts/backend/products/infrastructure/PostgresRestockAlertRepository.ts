import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { UserId } from "@/contexts/shared/domain/UserId";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import type { RestockAlert } from "../domain/RestockAlert";
import type {
	RestockAlertCountByVariantId,
	RestockAlertRepository,
} from "../domain/RestockAlertRepository";

export class PostgresRestockAlertRepository
	extends PostgresRepository
	implements RestockAlertRepository
{
	async save(alert: RestockAlert): Promise<void> {
		await this.sql`
			insert into restock_alerts (user_id, variant_id, requested_at)
			values (${alert.userId.value}, ${alert.variantId.value}, ${alert.requestedAt})
			on conflict (user_id, variant_id) do nothing
		`;
	}

	async searchVariantIdsOf(
		userId: UserId,
		variantIds: VariantId[],
	): Promise<VariantId[]> {
		const rows = await this.sql<Array<{ variant_id: string }>>`
			select variant_id
			from restock_alerts
			where user_id = ${userId.value}
				and variant_id = any(${variantIds.map((variantId) => variantId.value)})
			order by variant_id
		`;

		return rows.map((row) => new VariantId(row.variant_id));
	}

	async countByVariant(): Promise<RestockAlertCountByVariantId> {
		const rows = await this.sql<
			Array<{ variant_id: string; waiting: number }>
		>`
			select variant_id, count(*)::integer as waiting
			from restock_alerts
			group by variant_id
		`;

		return new Map(rows.map((row) => [row.variant_id, row.waiting]));
	}
}
