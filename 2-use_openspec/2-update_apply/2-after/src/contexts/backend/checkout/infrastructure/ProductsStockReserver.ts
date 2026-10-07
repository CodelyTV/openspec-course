import { NotEnoughStockError } from "@/contexts/backend/products/application/decrease-stock/NotEnoughStockError";
import type { StockDecreaser } from "@/contexts/backend/products/application/decrease-stock/StockDecreaser";

import type { CheckoutLine } from "../domain/CheckoutLine";
import { VariantOutOfStockError } from "../domain/errors/VariantOutOfStockError";
import { StockReserver } from "../domain/StockReserver";

export class ProductsStockReserver extends StockReserver {
	constructor(private readonly stockDecreaser: StockDecreaser) {
		super();
	}

	async reserve(lines: CheckoutLine[]): Promise<void> {
		try {
			await this.stockDecreaser.decrease(
				lines.map((line) => ({
					variantId: line.variantId.value,
					quantity: line.quantity,
				})),
			);
		} catch (error) {
			if (error instanceof NotEnoughStockError) {
				throw new VariantOutOfStockError(error.variantId);
			}

			throw error;
		}
	}
}
