import { describe, expect, it } from "vitest";

import { ProductPurchaseChecker } from "@/contexts/backend/orders/application/check-purchase/ProductPurchaseChecker";
import type { Order } from "@/contexts/backend/orders/domain/Order";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { OrderLineMother } from "../../domain/OrderLineMother";
import { OrderMother } from "../../domain/OrderMother";

describe("ProductPurchaseChecker should", () => {
	const orderRepository = Mock.create<OrderRepository>();
	const checker = new ProductPurchaseChecker(orderRepository);
	const userId = "user-aibuilder";

	function orderWithProducts(...productIds: string[]): Order {
		return OrderMother.create({
			userId,
			lines: productIds.map((productId) =>
				OrderLineMother.createPrimitives({ productId }),
			),
		});
	}

	it("say the user has not bought the product when they have no orders", async () => {
		orderRepository.searchByUserShouldReturn([]);

		expect(await checker.hasBought(userId, "hoodie")).toBe(false);
		orderRepository.expectSearchByUserToHaveBeenCalledWith(
			new UserId(userId),
		);
	});

	it("say the user has not bought the product when none of their orders includes it", async () => {
		orderRepository.searchByUserShouldReturn([
			orderWithProducts("tee", "chinos"),
			orderWithProducts("jacket"),
		]);

		expect(await checker.hasBought(userId, "hoodie")).toBe(false);
	});

	it("say the user bought the product whatever the variant they chose", async () => {
		orderRepository.searchByUserShouldReturn([
			OrderMother.create({
				userId,
				lines: [
					OrderLineMother.createPrimitives({
						productId: "hoodie",
						variantId: "hoodie-camel-l",
					}),
				],
			}),
		]);

		expect(await checker.hasBought(userId, "hoodie")).toBe(true);
	});

	it("say the user bought the product when it is only in an older order", async () => {
		orderRepository.searchByUserShouldReturn([
			orderWithProducts("tee"),
			orderWithProducts("chinos", "hoodie"),
		]);

		expect(await checker.hasBought(userId, "hoodie")).toBe(true);
	});
});
