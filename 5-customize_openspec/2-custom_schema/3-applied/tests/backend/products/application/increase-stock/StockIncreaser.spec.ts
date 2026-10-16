import { describe, expect, it, vi } from "vitest";

import { StockIncreaser } from "@/contexts/backend/products/application/increase-stock/StockIncreaser";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { Mock } from "../../../../shared/Mock";

describe("StockIncreaser should", () => {
	const repository = Mock.create<ProductRepository>();
	const increaser = new StockIncreaser(repository);

	function increasedVariantIdsInOrder(): string[] {
		return vi
			.mocked(repository.increaseStock)
			.mock.calls.map(([variantId]) => variantId.value);
	}

	it("increase the stock of every variant", async () => {
		await increaser.increase([
			{ variantId: "v1", quantity: 1 },
			{ variantId: "v2", quantity: 2 },
		]);

		repository.expectIncreaseStockToHaveBeenCalledWith(
			new VariantId("v1"),
			1,
		);
		repository.expectIncreaseStockToHaveBeenCalledWith(
			new VariantId("v2"),
			2,
		);
	});

	it("increase the stock in a stable order so concurrent increases do not deadlock", async () => {
		await increaser.increase([
			{ variantId: "v3", quantity: 1 },
			{ variantId: "v1", quantity: 1 },
			{ variantId: "v2", quantity: 1 },
		]);

		expect(increasedVariantIdsInOrder()).toEqual(["v1", "v2", "v3"]);
	});
});
