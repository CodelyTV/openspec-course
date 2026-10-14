import type { UserId } from "@/contexts/shared/domain/UserId";
import type { VariantId } from "@/contexts/shared/domain/VariantId";

import type { RestockAlert } from "./RestockAlert";

export type RestockAlertCountByVariantId = Map<string, number>;

export abstract class RestockAlertRepository {
	abstract save(alert: RestockAlert): Promise<void>;

	abstract searchVariantIdsOf(
		userId: UserId,
		variantIds: VariantId[],
	): Promise<VariantId[]>;

	abstract countByVariant(): Promise<RestockAlertCountByVariantId>;
}
