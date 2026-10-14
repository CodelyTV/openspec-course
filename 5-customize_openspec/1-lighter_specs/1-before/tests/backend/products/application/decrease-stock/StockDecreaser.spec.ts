import { describe, expect, it, vi } from "vitest";

import { NotEnoughStockError } from "@/contexts/backend/products/application/decrease-stock/NotEnoughStockError";
import { StockDecreaser } from "@/contexts/backend/products/application/decrease-stock/StockDecreaser";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { Mock } from "../../../../shared/Mock";

describe("StockDecreaser should", () => {
	const repository = Mock.create<ProductRepository>();
	const decreaser = new StockDecreaser(repository);

	function variantsWithoutEnoughStock(...variantIds: string[]): void {
		vi.mocked(repository.decreaseStockIfEnoughUnitsLeft).mockImplementation(
			async (variantId) => !variantIds.includes(variantId.value),
		);
	}

	function decreasedVariantIdsInOrder(): string[] {
		return vi
			.mocked(repository.decreaseStockIfEnoughUnitsLeft)
			.mock.calls.map(([variantId]) => variantId.value);
	}

	it("decrease the stock of every variant by its quantity", async () => {
		variantsWithoutEnoughStock();

		await decreaser.decrease([
			{ variantId: "v1", quantity: 2 },
			{ variantId: "v2", quantity: 1 },
		]);

		repository.expectDecreaseStockIfEnoughUnitsLeftToHaveBeenCalledWith(
			new VariantId("v1"),
			2,
		);
		repository.expectDecreaseStockIfEnoughUnitsLeftToHaveBeenCalledWith(
			new VariantId("v2"),
			1,
		);
	});

	it("decrease the stock in a stable order so concurrent decreases do not deadlock", async () => {
		variantsWithoutEnoughStock();

		await decreaser.decrease([
			{ variantId: "v3", quantity: 1 },
			{ variantId: "v1", quantity: 1 },
			{ variantId: "v2", quantity: 1 },
		]);

		expect(decreasedVariantIdsInOrder()).toEqual(["v1", "v2", "v3"]);
	});

	it("fail when a variant does not have enough stock left", async () => {
		variantsWithoutEnoughStock("scarce");

		await expect(
			decreaser.decrease([
				{ variantId: "plenty", quantity: 1 },
				{ variantId: "scarce", quantity: 3 },
			]),
		).rejects.toEqual(new NotEnoughStockError("scarce"));
	});
});
