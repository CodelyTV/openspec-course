import { describe, expect, it } from "vitest";

import { OrdersLister } from "@/contexts/backend/orders/application/list/OrdersLister";
import {
	type CustomerDirectory,
	CustomerNames,
} from "@/contexts/backend/orders/domain/CustomerDirectory";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { OrderLineMother } from "../../domain/OrderLineMother";
import { OrderMother } from "../../domain/OrderMother";

describe("OrdersLister should", () => {
	const orderRepository = Mock.create<OrderRepository>();
	const customerDirectory = Mock.create<CustomerDirectory>();
	const lister = new OrdersLister(orderRepository, customerDirectory);
	const noKnownCustomers = new CustomerNames(new Map());

	it("list every order with the name of its customer, its subtotal and its item count", async () => {
		const order = OrderMother.create({
			id: "order-1",
			userId: "user-ada",
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
		customerDirectory.namesOfShouldReturn(
			new CustomerNames(new Map([["user-ada", "Ada Lovelace"]])),
		);

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
		customerDirectory.expectNamesOfToHaveBeenCalledWith([
			new UserId("user-ada"),
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
		customerDirectory.namesOfShouldReturn(noKnownCustomers);

		const [order] = await lister.list();

		expect(order.currency).toBe("USD");
	});

	it("show the customer id when the customer is no longer a known user", async () => {
		orderRepository.searchAllShouldReturn([
			OrderMother.create({ userId: "user-gone" }),
		]);
		customerDirectory.namesOfShouldReturn(noKnownCustomers);

		const [order] = await lister.list();

		expect(order.customerName).toBe("user-gone");
	});

	it("keep the order in which the repository returns the orders", async () => {
		orderRepository.searchAllShouldReturn([
			OrderMother.create({ id: "newest" }),
			OrderMother.create({ id: "oldest" }),
		]);
		customerDirectory.namesOfShouldReturn(noKnownCustomers);

		const orders = await lister.list();

		expect(orders.map((order) => order.id)).toEqual(["newest", "oldest"]);
	});

	it("return no orders when none has been placed", async () => {
		orderRepository.searchAllShouldReturn([]);
		customerDirectory.namesOfShouldReturn(noKnownCustomers);

		expect(await lister.list()).toEqual([]);
	});
});
