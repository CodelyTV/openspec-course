import { describe, expect, it } from "vitest";

import { PurchasedProductFinder } from "@/contexts/backend/orders/application/find-purchased-product/PurchasedProductFinder";
import type { Order } from "@/contexts/backend/orders/domain/Order";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { OrderLineMother } from "../../domain/OrderLineMother";
import { OrderMother } from "../../domain/OrderMother";

describe("PurchasedProductFinder should", () => {
	const orderRepository = Mock.create<OrderRepository>();
	const finder = new PurchasedProductFinder(orderRepository);
	const userId = "user-ana";

	function orderOf(createdAt: string, ...lines: [string, string][]): Order {
		return OrderMother.create({
			userId,
			createdAt,
			lines: lines.map(([productId, productName]) =>
				OrderLineMother.createPrimitives({ productId, productName }),
			),
		});
	}

	it("return the product with its name in the most recent order containing it", async () => {
		orderRepository.searchByUserShouldReturn([
			orderOf("2026-03-01T10:00:00.000Z", ["tee", "Old Tee Name"]),
			orderOf(
				"2026-05-01T10:00:00.000Z",
				["jeans", "Jeans"],
				["tee", "Pure Function Tee"],
			),
			orderOf("2026-06-01T10:00:00.000Z", ["jacket", "Jacket"]),
		]);

		expect(await finder.find(userId, "tee")).toEqual({
			productId: "tee",
			productName: "Pure Function Tee",
		});
		orderRepository.expectSearchByUserToHaveBeenCalledWith(
			new UserId(userId),
		);
	});

	it("return null when the user never bought the product", async () => {
		orderRepository.searchByUserShouldReturn([
			orderOf("2026-05-01T10:00:00.000Z", ["jeans", "Jeans"]),
		]);

		expect(await finder.find(userId, "tee")).toBeNull();
	});

	it("return null when the user has no orders", async () => {
		orderRepository.searchByUserShouldReturn([]);

		expect(await finder.find(userId, "tee")).toBeNull();
	});
});
