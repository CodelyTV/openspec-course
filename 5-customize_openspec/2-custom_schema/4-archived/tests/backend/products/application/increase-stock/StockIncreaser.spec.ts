import { describe, it } from "vitest";

import { StockIncreaser } from "@/contexts/backend/products/application/increase-stock/StockIncreaser";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { Mock } from "../../../../shared/Mock";

describe("StockIncreaser should", () => {
	const repository = Mock.create<ProductRepository>();
	const increaser = new StockIncreaser(repository);

	it("increase the online stock of every variant", async () => {
		await increaser.increase([
			{ variantId: "v1", quantity: 2 },
			{ variantId: "v2", quantity: 1 },
		]);

		repository.expectIncreaseStockToHaveBeenCalledWith(
			new VariantId("v1"),
			2,
		);
		repository.expectIncreaseStockToHaveBeenCalledWith(
			new VariantId("v2"),
			1,
		);
	});
});
