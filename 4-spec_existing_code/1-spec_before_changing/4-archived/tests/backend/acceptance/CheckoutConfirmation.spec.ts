import { faker } from "@faker-js/faker";
import { beforeEach, expect, it, vi } from "vitest";

import { CheckoutConfirmer } from "@/contexts/backend/checkout/application/confirm/CheckoutConfirmer";
import { Checkout } from "@/contexts/backend/checkout/domain/Checkout";
import { CheckoutId } from "@/contexts/backend/checkout/domain/CheckoutId";
import { EmptyCheckoutError } from "@/contexts/backend/checkout/domain/errors/EmptyCheckoutError";
import { VariantOutOfStockError } from "@/contexts/backend/checkout/domain/errors/VariantOutOfStockError";
import { OrdersOrderPlacement } from "@/contexts/backend/checkout/infrastructure/OrdersOrderPlacement";
import { PostgresCheckoutRepository } from "@/contexts/backend/checkout/infrastructure/PostgresCheckoutRepository";
import { ProductsCheckoutCatalog } from "@/contexts/backend/checkout/infrastructure/ProductsCheckoutCatalog";
import { ProductsStockReserver } from "@/contexts/backend/checkout/infrastructure/ProductsStockReserver";
import { OrderPlacer } from "@/contexts/backend/orders/application/place/OrderPlacer";
import { PostgresOrderRepository } from "@/contexts/backend/orders/infrastructure/PostgresOrderRepository";
import { StockDecreaser } from "@/contexts/backend/products/application/decrease-stock/StockDecreaser";
import { VariantsSearcher } from "@/contexts/backend/products/application/search-variants/VariantsSearcher";
import { PostgresProductRepository } from "@/contexts/backend/products/infrastructure/PostgresProductRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { PostgresUnitOfWork } from "@/contexts/backend/shared/infrastructure/PostgresUnitOfWork";
import type { Clock } from "@/contexts/shared/domain/Clock";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { Mock } from "../../shared/Mock";
import { ProductMother } from "../products/domain/ProductMother";
import { ProductVariantMother } from "../products/domain/ProductVariantMother";
import { describeWithEnvironmentArranger } from "../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../shared/infrastructure/RetailEnvironmentArranger";
import { UserMother } from "../users/domain/UserMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const checkoutRepository = new PostgresCheckoutRepository(connection);
const productRepository = new PostgresProductRepository(connection);
const orderRepository = new PostgresOrderRepository(connection);

const idGenerator = Mock.create<IdGenerator>();
const clock = Mock.create<Clock>();
const currentUserProvider = Mock.create<CurrentUserProvider>();
const confirmer = new CheckoutConfirmer(
	checkoutRepository,
	new ProductsCheckoutCatalog(new VariantsSearcher(productRepository)),
	new ProductsStockReserver(new StockDecreaser(productRepository)),
	new OrdersOrderPlacement(
		new OrderPlacer(orderRepository, idGenerator, clock),
	),
	currentUserProvider,
	new PostgresUnitOfWork(connection),
);

const user = UserMother.create();
const product = ProductMother.create({
	id: "p1",
	price: { amount: 40, currency: "EUR" },
	variants: [
		ProductVariantMother.createPrimitives({
			id: "plenty",
			size: "S",
			onlineStock: 10,
		}),
		ProductVariantMother.createPrimitives({
			id: "scarce",
			size: "M",
			onlineStock: 1,
		}),
	],
});

async function givenCartWith(
	...units: Array<{ variantId: string; quantity: number }>
): Promise<void> {
	let checkout = Checkout.create(
		new CheckoutId(faker.string.uuid()),
		user.id,
	);

	for (const { variantId, quantity } of units) {
		for (let unit = 0; unit < quantity; unit++) {
			checkout = checkout.addVariant("p1", new VariantId(variantId));
		}
	}

	await checkoutRepository.save(checkout);
}

async function onlineStockOf(variantId: string): Promise<number | undefined> {
	const found = await productRepository.searchByVariantId(
		new VariantId(variantId),
	);

	return found?.variant(new VariantId(variantId))?.onlineStock;
}

async function placedOrdersCount(): Promise<number> {
	return (await orderRepository.searchByUser(user.id)).length;
}

async function cartItemCount(): Promise<number | undefined> {
	return (await checkoutRepository.searchByUser(user.id))?.itemCount();
}

describeWithEnvironmentArranger(
	arranger,
	"Checkout confirmation across checkout, products and orders should",
	() => {
		beforeEach(async () => {
			vi.mocked(idGenerator.generate).mockImplementation(() =>
				faker.string.uuid(),
			);
			clock.nowShouldReturn(new Date("2026-03-14T10:00:00.000Z"));
			currentUserProvider.currentUserIdShouldReturn(user.id);
			await arranger.givenUsers(user);
			await arranger.givenProducts(product);
		});

		it("place the order, decrease the stock and empty the cart together", async () => {
			await givenCartWith({ variantId: "plenty", quantity: 3 });

			const orderId = await confirmer.confirm();

			const [order] = await orderRepository.searchByUser(user.id);
			expect(order.id.value).toBe(orderId);
			expect(order.subtotal.toPrimitives()).toEqual({
				amount: 120,
				currency: "EUR",
			});
			expect(await onlineStockOf("plenty")).toBe(7);
			expect(await cartItemCount()).toBe(0);
		});

		it("place a single order when the same cart is submitted twice at once", async () => {
			await givenCartWith({ variantId: "plenty", quantity: 2 });

			const results = await Promise.allSettled([
				confirmer.confirm(),
				confirmer.confirm(),
			]);

			const failures = results.filter(
				(result) => result.status === "rejected",
			);
			expect(
				results.filter((r) => r.status === "fulfilled"),
			).toHaveLength(1);
			expect(failures).toHaveLength(1);
			expect(failures[0].reason).toBeInstanceOf(EmptyCheckoutError);
			expect(await placedOrdersCount()).toBe(1);
			expect(await onlineStockOf("plenty")).toBe(8);
		});

		it("change nothing when a line runs out of stock while confirming", async () => {
			await givenCartWith(
				{ variantId: "plenty", quantity: 2 },
				{ variantId: "scarce", quantity: 1 },
			);
			await productRepository.decreaseStockIfEnoughUnitsLeft(
				new VariantId("scarce"),
				1,
			);

			await expect(confirmer.confirm()).rejects.toBeInstanceOf(
				VariantOutOfStockError,
			);
			expect(await placedOrdersCount()).toBe(0);
			expect(await onlineStockOf("plenty")).toBe(10);
			expect(await cartItemCount()).toBe(3);
		});
	},
);
