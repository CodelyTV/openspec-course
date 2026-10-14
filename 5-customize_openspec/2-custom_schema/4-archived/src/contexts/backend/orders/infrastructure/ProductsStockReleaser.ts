import type { StockIncreaser } from "@/contexts/backend/products/application/increase-stock/StockIncreaser";

import type { OrderLine } from "../domain/OrderLine";
import { StockReleaser } from "../domain/StockReleaser";

export class ProductsStockReleaser extends StockReleaser {
	constructor(private readonly stockIncreaser: StockIncreaser) {
		super();
	}

	async release(lines: OrderLine[]): Promise<void> {
		await this.stockIncreaser.increase(
			lines.map((line) => ({
				variantId: line.variantId,
				quantity: line.quantity,
			})),
		);
	}
}
