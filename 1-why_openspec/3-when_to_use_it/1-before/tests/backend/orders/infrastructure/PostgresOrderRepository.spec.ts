import { expect, it } from "vitest";

import { OrderId } from "@/contexts/backend/orders/domain/OrderId";
import type { OrderLinePrimitives } from "@/contexts/backend/orders/domain/OrderLine";
import { PostgresOrderRepository } from "@/contexts/backend/orders/infrastructure/PostgresOrderRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import type { MoneyPrimitives } from "@/contexts/shared/domain/Money";
import { UserId } from "@/contexts/shared/domain/UserId";

import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { UserMother } from "../../users/domain/UserMother";
import { OrderLineMother } from "../domain/OrderLineMother";
import { OrderMother } from "../domain/OrderMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresOrderRepository(connection);

const user = UserMother.create({ id: "user-aibuilder" });
const otherUser = UserMother.create({ id: "user-other" });

async function seedUsers(): Promise<void> {
	await arranger.givenUsers(user, otherUser);
}

describeWithEnvironmentArranger(
	arranger,
	"PostgresOrderRepository should",
	() => {
		const lineOf = (
			quantity: number,
			unitPrice: MoneyPrimitives = { amount: 50, currency: "EUR" },
		): OrderLinePrimitives =>
			OrderLineMother.createPrimitives({ quantity, unitPrice });

		it("save an order and read it back with its creation date and what was bought", async () => {
			await seedUsers();
			const order = OrderMother.create({
				userId: "user-aibuilder",
				createdAt: "2026-01-15T09:30:00.000Z",
				lines: [
					OrderLineMother.createPrimitives({
						productId: "product-no-longer-in-the-catalog",
						productName: "Tee",
						color: "Black",
						size: "M",
						quantity: 2,
						unitPrice: { amount: 50, currency: "EUR" },
					}),
				],
			});

			await repository.save(order);
			const found = await repository.search(order.id);

			expect(found?.toPrimitives()).toEqual(order.toPrimitives());
		});

		it("find nothing for an unknown order id", async () => {
			await seedUsers();

			expect(
				await repository.search(
					new OrderId(OrderMother.createPrimitives().id),
				),
			).toBeNull();
		});

		it("list saved orders newest first", async () => {
			await seedUsers();
			const older = OrderMother.create({
				userId: "user-aibuilder",
				createdAt: "2026-01-15T09:30:00.000Z",
				lines: [lineOf(1)],
			});
			const newer = OrderMother.create({
				userId: "user-other",
				createdAt: "2026-02-15T09:30:00.000Z",
				lines: [lineOf(1)],
			});
			await repository.save(older);
			await repository.save(newer);

			const orders = await repository.searchAll();

			expect(orders.map((order) => order.id.value)).toEqual([
				newer.id.value,
				older.id.value,
			]);
		});

		it("list saved orders and count their items", async () => {
			await seedUsers();
			await repository.save(
				OrderMother.create({
					userId: "user-aibuilder",
					lines: [lineOf(3)],
				}),
			);

			const orders = await repository.searchAll();

			expect(orders).toHaveLength(1);
			expect(orders[0].items()).toBe(3);
			expect(orders[0].subtotal.amount).toBe(150);
		});

		it("list only the latest orders up to the limit, newest first, with their lines", async () => {
			await seedUsers();
			const oldest = OrderMother.create({
				userId: "user-aibuilder",
				createdAt: "2026-01-15T09:30:00.000Z",
				lines: [lineOf(1)],
			});
			const middle = OrderMother.create({
				userId: "user-other",
				createdAt: "2026-02-15T09:30:00.000Z",
				lines: [lineOf(1)],
			});
			const newest = OrderMother.create({
				userId: "user-aibuilder",
				createdAt: "2026-03-15T09:30:00.000Z",
				lines: [lineOf(2)],
			});
			await repository.save(oldest);
			await repository.save(middle);
			await repository.save(newest);

			const orders = await repository.searchLatest(2);

			expect(orders.map((order) => order.toPrimitives())).toEqual([
				newest.toPrimitives(),
				middle.toPrimitives(),
			]);
		});

		it("list no latest orders when none has been placed", async () => {
			expect(await repository.searchLatest(5)).toEqual([]);
		});

		it("list orders scoped to a user", async () => {
			await seedUsers();
			const ownOrder = OrderMother.create({
				userId: "user-aibuilder",
				lines: [lineOf(1)],
			});
			await repository.save(ownOrder);
			await repository.save(
				OrderMother.create({
					userId: "user-other",
					lines: [lineOf(1)],
				}),
			);

			const orders = await repository.searchByUser(
				new UserId("user-aibuilder"),
			);

			expect(orders.map((order) => order.toPrimitives())).toEqual([
				ownOrder.toPrimitives(),
			]);
		});

		it("sum the revenue and count the orders of each currency, sorted by currency", async () => {
			await seedUsers();
			await repository.save(
				OrderMother.create({
					userId: "user-aibuilder",
					lines: [lineOf(1, { amount: 40, currency: "USD" })],
				}),
			);
			await repository.save(
				OrderMother.create({
					userId: "user-aibuilder",
					lines: [lineOf(1, { amount: 30, currency: "EUR" })],
				}),
			);
			await repository.save(
				OrderMother.create({
					userId: "user-other",
					lines: [lineOf(2, { amount: 25, currency: "EUR" })],
				}),
			);

			const revenues = await repository.revenuePerCurrency();

			expect(
				revenues.map(({ revenue, ordersCount }) => ({
					revenue: revenue.toPrimitives(),
					ordersCount,
				})),
			).toEqual([
				{ revenue: { amount: 80, currency: "EUR" }, ordersCount: 2 },
				{ revenue: { amount: 40, currency: "USD" }, ordersCount: 1 },
			]);
		});

		it("report no revenue when no order has been placed", async () => {
			expect(await repository.revenuePerCurrency()).toEqual([]);
		});
	},
);
