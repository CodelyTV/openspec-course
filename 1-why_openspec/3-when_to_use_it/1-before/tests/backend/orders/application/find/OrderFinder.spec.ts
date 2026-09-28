import { describe, expect, it } from "vitest";

import { OrderFinder } from "@/contexts/backend/orders/application/find/OrderFinder";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import { ProductId } from "@/contexts/backend/products/domain/ProductId";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { UserRepository } from "@/contexts/backend/users/domain/UserRepository";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../../products/domain/ProductMother";
import { ProductVariantMother } from "../../../products/domain/ProductVariantMother";
import { UserMother } from "../../../users/domain/UserMother";
import { OrderLineMother } from "../../domain/OrderLineMother";
import { OrderMother } from "../../domain/OrderMother";

describe("OrderFinder should", () => {
	const orderRepository = Mock.create<OrderRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const userRepository = Mock.create<UserRepository>();
	const finder = new OrderFinder(
		orderRepository,
		productRepository,
		userRepository,
	);

	const customer = UserMother.create({ name: "AI Builder" });
	const product = ProductMother.create({
		id: "tee",
		name: "Tee",
		variants: [
			ProductVariantMother.createPrimitives({
				id: "tee-m",
				color: "Black",
				size: "M",
			}),
		],
	});
	const order = OrderMother.create({
		userId: customer.id.value,
		lines: [
			OrderLineMother.createPrimitives({
				productId: "tee",
				variantId: "tee-m",
				quantity: 2,
				unitPrice: { amount: 30, currency: "EUR" },
			}),
		],
	});

	it("return the order with its customer and the products of its lines", async () => {
		orderRepository.searchShouldReturn(order);
		productRepository.searchByIdsShouldReturn([product]);
		userRepository.searchShouldReturn(customer);

		expect(await finder.find(order.id.value)).toEqual({
			id: order.id.value,
			userId: customer.id.value,
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
		productRepository.expectSearchByIdsToHaveBeenCalledWith([
			new ProductId("tee"),
		]);
	});

	it("return null when the order does not exist", async () => {
		orderRepository.searchShouldReturn(null);

		expect(await finder.find("missing")).toBeNull();
	});

	it("return null for a blank id without looking it up", async () => {
		expect(await finder.find(" ")).toBeNull();
		orderRepository.expectSearchNotToHaveBeenCalled();
	});

	it("fail instead of hiding a line whose product no longer exists", async () => {
		orderRepository.searchShouldReturn(order);
		productRepository.searchByIdsShouldReturn([]);
		userRepository.searchShouldReturn(customer);

		await expect(finder.find(order.id.value)).rejects.toBeInstanceOf(
			ProductNotFoundError,
		);
	});
});
