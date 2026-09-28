import { describe, expect, it } from "vitest";

import { OrdersLister } from "@/contexts/backend/orders/application/list/OrdersLister";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import type { UserRepository } from "@/contexts/backend/users/domain/UserRepository";

import { Mock } from "../../../../shared/Mock";
import { UserMother } from "../../../users/domain/UserMother";
import { OrderLineMother } from "../../domain/OrderLineMother";
import { OrderMother } from "../../domain/OrderMother";

describe("OrdersLister should", () => {
	const orderRepository = Mock.create<OrderRepository>();
	const userRepository = Mock.create<UserRepository>();
	const lister = new OrdersLister(orderRepository, userRepository);

	it("list every order with the name of its customer, its subtotal and its item count", async () => {
		const customer = UserMother.create({ name: "Ada Lovelace" });
		const order = OrderMother.create({
			id: "order-1",
			userId: customer.id.value,
			createdAt: "2026-03-14T10:00:00.000Z",
			status: "confirmed",
			lines: [
				OrderLineMother.createPrimitives({
					quantity: 2,
					unitPrice: { amount: 50, currency: "EUR" },
				}),
				OrderLineMother.createPrimitives({
					quantity: 1,
					unitPrice: { amount: 30, currency: "EUR" },
				}),
			],
		});
		orderRepository.searchAllShouldReturn([order]);
		userRepository.searchAllShouldReturn([customer, UserMother.create()]);

		expect(await lister.list()).toEqual([
			{
				id: "order-1",
				createdAt: "2026-03-14T10:00:00.000Z",
				status: "confirmed",
				customerName: "Ada Lovelace",
				subtotalAmount: 130,
				currency: "EUR",
				items: 3,
			},
		]);
	});

	it("report each order in the currency it was placed in", async () => {
		orderRepository.searchAllShouldReturn([
			OrderMother.create({
				lines: [
					OrderLineMother.createPrimitives({
						unitPrice: { amount: 40, currency: "USD" },
					}),
				],
			}),
		]);
		userRepository.searchAllShouldReturn([]);

		const [order] = await lister.list();

		expect(order.currency).toBe("USD");
	});

	it("show the customer id when the customer is no longer a known user", async () => {
		orderRepository.searchAllShouldReturn([
			OrderMother.create({ userId: "user-gone" }),
		]);
		userRepository.searchAllShouldReturn([]);

		const [order] = await lister.list();

		expect(order.customerName).toBe("user-gone");
	});

	it("keep the order in which the repository returns the orders", async () => {
		orderRepository.searchAllShouldReturn([
			OrderMother.create({ id: "newest" }),
			OrderMother.create({ id: "oldest" }),
		]);
		userRepository.searchAllShouldReturn([]);

		const orders = await lister.list();

		expect(orders.map((order) => order.id)).toEqual(["newest", "oldest"]);
	});

	it("return no orders when none has been placed", async () => {
		orderRepository.searchAllShouldReturn([]);
		userRepository.searchAllShouldReturn([UserMother.create()]);

		expect(await lister.list()).toEqual([]);
	});
});
