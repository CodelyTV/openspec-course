import { describe, expect, it } from "vitest";

import { OrderFinder } from "@/contexts/backend/orders/application/find/OrderFinder";
import {
	type CustomerDirectory,
	CustomerNames,
} from "@/contexts/backend/orders/domain/CustomerDirectory";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { OrderLineMother } from "../../domain/OrderLineMother";
import { OrderMother } from "../../domain/OrderMother";

describe("OrderFinder should", () => {
	const orderRepository = Mock.create<OrderRepository>();
	const customerDirectory = Mock.create<CustomerDirectory>();
	const finder = new OrderFinder(orderRepository, customerDirectory);

	const customerId = new UserId("user-aibuilder");
	const order = OrderMother.create({
		userId: customerId.value,
		lines: [
			OrderLineMother.createPrimitives({
				productName: "Tee",
				color: "Black",
				size: "M",
				quantity: 2,
				unitPrice: { amount: 30, currency: "EUR" },
			}),
		],
	});

	it("return the order with its customer and what was bought on each line", async () => {
		orderRepository.searchShouldReturn(order);
		customerDirectory.namesOfShouldReturn(
			new CustomerNames(new Map([[customerId.value, "AI Builder"]])),
		);

		expect(await finder.find(order.id.value)).toEqual({
			id: order.id.value,
			userId: customerId.value,
			customerName: "AI Builder",
			createdAt: order.createdAt.toISOString(),
			status: "confirmed",
			deliveryMethod: order.deliveryMethod,
			subtotalAmount: 60,
			currency: "EUR",
			lines: [
				{
					productName: "Tee",
					color: "Black",
					size: "M",
					quantity: 2,
					unitPriceAmount: 30,
				},
			],
		});
		customerDirectory.expectNamesOfToHaveBeenCalledWith([customerId]);
	});

	it("sort the lines by product name", async () => {
		orderRepository.searchShouldReturn(
			OrderMother.create({
				lines: [
					OrderLineMother.createPrimitives({
						productName: "Sweatshirt",
						unitPrice: { amount: 60, currency: "EUR" },
					}),
					OrderLineMother.createPrimitives({
						productName: "Cap",
						unitPrice: { amount: 20, currency: "EUR" },
					}),
				],
			}),
		);
		customerDirectory.namesOfShouldReturn(new CustomerNames(new Map()));

		const found = await finder.find(order.id.value);

		expect(found?.lines.map((line) => line.productName)).toEqual([
			"Cap",
			"Sweatshirt",
		]);
	});

	it("show the customer id when the customer is no longer a known user", async () => {
		orderRepository.searchShouldReturn(order);
		customerDirectory.namesOfShouldReturn(new CustomerNames(new Map()));

		expect((await finder.find(order.id.value))?.customerName).toBe(
			customerId.value,
		);
	});

	it("return null when the order does not exist", async () => {
		orderRepository.searchShouldReturn(null);

		expect(await finder.find("missing")).toBeNull();
	});

	it("return null for a blank id without looking it up", async () => {
		expect(await finder.find(" ")).toBeNull();
		orderRepository.expectSearchNotToHaveBeenCalled();
	});
});
