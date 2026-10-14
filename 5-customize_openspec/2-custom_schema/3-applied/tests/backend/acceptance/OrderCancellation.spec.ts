import { beforeEach, expect, it } from "vitest";

import { UserOrderCanceller } from "@/contexts/backend/orders/application/cancel-mine/UserOrderCanceller";
import type { Order } from "@/contexts/backend/orders/domain/Order";
import { PostgresOrderRepository } from "@/contexts/backend/orders/infrastructure/PostgresOrderRepository";
import { ProductsStockReleaser } from "@/contexts/backend/orders/infrastructure/ProductsStockReleaser";
import { StockIncreaser } from "@/contexts/backend/products/application/increase-stock/StockIncreaser";
import { PostgresProductRepository } from "@/contexts/backend/products/infrastructure/PostgresProductRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { PostgresUnitOfWork } from "@/contexts/backend/shared/infrastructure/PostgresUnitOfWork";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { Mock } from "../../shared/Mock";
import { OrderLineMother } from "../orders/domain/OrderLineMother";
import { OrderMother } from "../orders/domain/OrderMother";
import { ProductMother } from "../products/domain/ProductMother";
import { ProductVariantMother } from "../products/domain/ProductVariantMother";
import { describeWithEnvironmentArranger } from "../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../shared/infrastructure/RetailEnvironmentArranger";
import { UserMother } from "../users/domain/UserMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const productRepository = new PostgresProductRepository(connection);
const orderRepository = new PostgresOrderRepository(connection);

const currentUserProvider = Mock.create<CurrentUserProvider>();
const canceller = new UserOrderCanceller(
	orderRepository,
	new ProductsStockReleaser(new StockIncreaser(productRepository)),
	currentUserProvider,
	new PostgresUnitOfWork(connection),
);

const user = UserMother.create();
const overshirt = ProductMother.create({
	id: "hexagonal-overshirt",
	name: "Hexagonal Overshirt",
	variants: [
		ProductVariantMother.createPrimitives({
			id: "overshirt-moss-l",
			color: "Moss",
			size: "L",
			onlineStock: 0,
		}),
	],
});
const discontinued = ProductMother.create({
	id: "discontinued-tee",
	variants: [
		ProductVariantMother.createPrimitives({ id: "discontinued-tee-m" }),
	],
});

async function givenConfirmedOrderWith(
	...units: Array<{ productId: string; variantId: string; quantity: number }>
): Promise<Order> {
	const order = OrderMother.create({
		userId: user.id.value,
		status: "confirmed",
		lines: units.map((unit) => OrderLineMother.createPrimitives(unit)),
	});
	await orderRepository.save(order);

	return order;
}

async function onlineStockOf(variantId: string): Promise<number | undefined> {
	const found = await productRepository.searchByVariantId(
		new VariantId(variantId),
	);

	return found?.variant(new VariantId(variantId))?.onlineStock;
}

async function statusOf(order: Order): Promise<string | undefined> {
	return (await orderRepository.search(order.id))?.status;
}

describeWithEnvironmentArranger(
	arranger,
	"Order cancellation across orders and products should",
	() => {
		beforeEach(async () => {
			currentUserProvider.currentUserIdShouldReturn(user.id);
			await arranger.givenUsers(user);
			await arranger.givenProducts(overshirt, discontinued);
		});

		it("return the units of a cancelled order to stock", async () => {
			const order = await givenConfirmedOrderWith({
				productId: "hexagonal-overshirt",
				variantId: "overshirt-moss-l",
				quantity: 2,
			});

			await canceller.cancel(order.id.value);

			expect(await statusOf(order)).toBe("cancelled");
			expect(await onlineStockOf("overshirt-moss-l")).toBe(2);
		});

		it("return the units only once when the order is cancelled twice", async () => {
			const order = await givenConfirmedOrderWith({
				productId: "hexagonal-overshirt",
				variantId: "overshirt-moss-l",
				quantity: 2,
			});

			await Promise.all([
				canceller.cancel(order.id.value),
				canceller.cancel(order.id.value),
			]);
			await canceller.cancel(order.id.value);

			expect(await statusOf(order)).toBe("cancelled");
			expect(await onlineStockOf("overshirt-moss-l")).toBe(2);
		});

		it("cancel an order with a variant no longer in the catalog", async () => {
			const order = await givenConfirmedOrderWith(
				{
					productId: "hexagonal-overshirt",
					variantId: "overshirt-moss-l",
					quantity: 2,
				},
				{
					productId: "discontinued-tee",
					variantId: "discontinued-tee-m",
					quantity: 1,
				},
			);
			await arranger.removeProduct("discontinued-tee");

			await canceller.cancel(order.id.value);

			expect(await statusOf(order)).toBe("cancelled");
			expect(await onlineStockOf("overshirt-moss-l")).toBe(2);
			expect(await onlineStockOf("discontinued-tee-m")).toBeUndefined();
		});
	},
);
