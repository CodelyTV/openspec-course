import { beforeEach, describe, expect, it } from "vitest";

import { UserOrdersLister } from "@/contexts/backend/orders/application/list-mine/UserOrdersLister";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import type { CurrentUserProvider } from "@/contexts/backend/users/domain/CurrentUserProvider";
import { UserId } from "@/contexts/backend/users/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { OrderLineMother } from "../../domain/OrderLineMother";
import { OrderMother } from "../../domain/OrderMother";

describe("UserOrdersLister should", () => {
	const orderRepository = Mock.create<OrderRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const lister = new UserOrdersLister(orderRepository, currentUserProvider);
	const userId = new UserId("user-aibuilder");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(userId);
	});

	it("list the orders of the current user with their delivery method, subtotal and item count", async () => {
		orderRepository.searchByUserShouldReturn([
			OrderMother.create({
				id: "order-1",
				userId: userId.value,
				createdAt: "2026-03-14T10:00:00.000Z",
				status: "confirmed",
				deliveryMethod: "home-delivery",
				lines: [
					OrderLineMother.createPrimitives({
						quantity: 3,
						unitPrice: { amount: 20, currency: "EUR" },
					}),
				],
			}),
		]);

		expect(await lister.list()).toEqual([
			{
				id: "order-1",
				createdAt: "2026-03-14T10:00:00.000Z",
				status: "confirmed",
				deliveryMethod: "home-delivery",
				subtotalAmount: 60,
				currency: "EUR",
				items: 3,
			},
		]);
		orderRepository.expectSearchByUserToHaveBeenCalledWith(userId);
	});

	it("return no orders when the current user has not placed any", async () => {
		orderRepository.searchByUserShouldReturn([]);

		expect(await lister.list()).toEqual([]);
	});
});
