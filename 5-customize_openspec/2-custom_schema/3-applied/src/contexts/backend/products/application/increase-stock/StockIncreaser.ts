import { VariantId } from "@/contexts/shared/domain/VariantId";

import type { ProductRepository } from "../../domain/ProductRepository";

export type StockIncrease = {
	variantId: string;
	quantity: number;
};

export class StockIncreaser {
	constructor(private readonly repository: ProductRepository) {}

	async increase(increases: StockIncrease[]): Promise<void> {
		const inAStableOrderToAvoidDeadlocksBetweenConcurrentIncreases = [
			...increases,
		].sort((a, b) => a.variantId.localeCompare(b.variantId));

		await Promise.all(
			inAStableOrderToAvoidDeadlocksBetweenConcurrentIncreases.map(
				({ variantId, quantity }) =>
					this.repository.increaseStock(
						new VariantId(variantId),
						quantity,
					),
			),
		);
	}
}
