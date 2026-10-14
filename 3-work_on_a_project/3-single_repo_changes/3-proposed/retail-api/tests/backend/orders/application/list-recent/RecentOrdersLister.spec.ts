import { describe, expect, it } from "vitest";

import { RecentOrdersLister } from "@/contexts/backend/orders/application/list-recent/RecentOrdersLister";
import {
	type CustomerDirectory,
	CustomerNames,
} from "@/contexts/backend/orders/domain/CustomerDirectory";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { OrderLineMother } from "../../domain/OrderLineMother";
import { OrderMother } from "../../domain/OrderMother";

describe("RecentOrdersLister should", () => {
	const orderRepository = Mock.create<OrderRepository>();
	const customerDirectory = Mock.create<CustomerDirectory>();
	const lister = new RecentOrdersLister(orderRepository, customerDirectory);

	it("list the latest orders up to the limit with the name of their customer", async () => {
		orderRepository.searchLatestShouldReturn([
			OrderMother.create({
				id: "order-1",
				userId: "user-ada",
				createdAt: "2026-03-14T10:00:00.000Z",
				lines: [
					OrderLineMother.createPrimitives({
						quantity: 2,
						unitPrice: { amount: 45, currency: "USD" },
					}),
				],
			}),
		]);
		customerDirectory.namesOfShouldReturn(
			new CustomerNames(new Map([["user-ada", "Ada Lovelace"]])),
		);

		expect(await lister.list(5)).toEqual([
			{
				id: "order-1",
				createdAt: "2026-03-14T10:00:00.000Z",
				status: "confirmed",
				customerName: "Ada Lovelace",
				subtotalAmount: 90,
				currency: "USD",
				items: 2,
			},
		]);
		orderRepository.expectSearchLatestToHaveBeenCalledWith(5);
		customerDirectory.expectNamesOfToHaveBeenCalledWith([
			new UserId("user-ada"),
		]);
	});

	it("show the customer id when the customer is no longer a known user", async () => {
		orderRepository.searchLatestShouldReturn([
			OrderMother.create({ userId: "user-gone" }),
		]);
		customerDirectory.namesOfShouldReturn(new CustomerNames(new Map()));

		const [order] = await lister.list(5);

		expect(order.customerName).toBe("user-gone");
	});

	it("return no orders when none has been placed", async () => {
		orderRepository.searchLatestShouldReturn([]);
		customerDirectory.namesOfShouldReturn(new CustomerNames(new Map()));

		expect(await lister.list(5)).toEqual([]);
	});
});
