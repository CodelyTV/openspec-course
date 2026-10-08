import { describe, expect, it } from "vitest";

import type { PurchasedProductFinder } from "@/contexts/backend/orders/application/find-purchased-product/PurchasedProductFinder";
import { OrdersPurchaseHistory } from "@/contexts/backend/reviews/infrastructure/OrdersPurchaseHistory";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../shared/Mock";

describe("OrdersPurchaseHistory should", () => {
	const purchasedProductFinder = Mock.create<PurchasedProductFinder>();
	const purchaseHistory = new OrdersPurchaseHistory(purchasedProductFinder);

	it("return the product the user bought with its name in the orders", async () => {
		purchasedProductFinder.findShouldReturn({
			productId: "pure-function-tee",
			productName: "Pure Function Tee",
		});

		expect(
			await purchaseHistory.purchasedProduct(
				new UserId("user-ana"),
				new ProductId("pure-function-tee"),
			),
		).toEqual({
			productId: "pure-function-tee",
			productName: "Pure Function Tee",
		});
		purchasedProductFinder.expectFindToHaveBeenCalledWith(
			"user-ana",
			"pure-function-tee",
		);
	});

	it("return null when the user never bought the product", async () => {
		purchasedProductFinder.findShouldReturn(null);

		expect(
			await purchaseHistory.purchasedProduct(
				new UserId("user-ana"),
				new ProductId("pure-function-tee"),
			),
		).toBeNull();
	});
});
