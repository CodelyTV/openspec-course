import { VariantId } from "@/contexts/shared/domain/VariantId";

import type { ProductRepository } from "../../domain/ProductRepository";

import { NotEnoughStockError } from "./NotEnoughStockError";

export type StockDecrease = {
	variantId: string;
	quantity: number;
};

export class StockDecreaser {
	constructor(private readonly repository: ProductRepository) {}

	async decrease(decreases: StockDecrease[]): Promise<void> {
		const inAStableOrderToAvoidDeadlocksBetweenConcurrentDecreases = [
			...decreases,
		].sort((a, b) => a.variantId.localeCompare(b.variantId));

		const decreasedPerVariant = await Promise.all(
			inAStableOrderToAvoidDeadlocksBetweenConcurrentDecreases.map(
				({ variantId, quantity }) =>
					this.repository.decreaseStockIfEnoughUnitsLeft(
						new VariantId(variantId),
						quantity,
					),
			),
		);
		const decreaseWithoutEnoughStock =
			inAStableOrderToAvoidDeadlocksBetweenConcurrentDecreases.find(
				(_decrease, index) => !decreasedPerVariant[index],
			);

		if (decreaseWithoutEnoughStock) {
			throw new NotEnoughStockError(decreaseWithoutEnoughStock.variantId);
		}
	}
}
