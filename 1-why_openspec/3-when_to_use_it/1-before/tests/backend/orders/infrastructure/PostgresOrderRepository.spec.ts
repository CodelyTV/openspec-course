import { expect, it } from "vitest";

import { OrderId } from "@/contexts/backend/orders/domain/OrderId";
import type { OrderLinePrimitives } from "@/contexts/backend/orders/domain/OrderLine";
import { PostgresOrderRepository } from "@/contexts/backend/orders/infrastructure/PostgresOrderRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { UserId } from "@/contexts/backend/users/domain/UserId";

import { ProductMother } from "../../products/domain/ProductMother";
import { ProductVariantMother } from "../../products/domain/ProductVariantMother";
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

async function seedUsersProductAndVariant(): Promise<void> {
	await arranger.givenUsers(user, otherUser);
	await arranger.givenProducts(
		ProductMother.create({
			id: "p1",
			variants: [ProductVariantMother.createPrimitives({ id: "v1" })],
		}),
	);
}

describeWithEnvironmentArranger(
	arranger,
	"PostgresOrderRepository should",
	() => {
		const seededLine = (quantity: number): OrderLinePrimitives =>
			OrderLineMother.createPrimitives({
				productId: "p1",
				variantId: "v1",
				quantity,
				unitPrice: { amount: 50, currency: "EUR" },
			});

		it("save an order and read it back with its creation date", async () => {
			await seedUsersProductAndVariant();
			const order = OrderMother.create({
				userId: "user-aibuilder",
				createdAt: "2026-01-15T09:30:00.000Z",
				lines: [seededLine(2)],
			});

			await repository.save(order);
			const found = await repository.search(order.id);

			expect(found?.toPrimitives()).toEqual(order.toPrimitives());
		});

		it("find nothing for an unknown order id", async () => {
			await seedUsersProductAndVariant();

			expect(
				await repository.search(
					new OrderId(OrderMother.createPrimitives().id),
				),
			).toBeNull();
		});

		it("list saved orders newest first", async () => {
			await seedUsersProductAndVariant();
			const older = OrderMother.create({
				userId: "user-aibuilder",
				createdAt: "2026-01-15T09:30:00.000Z",
				lines: [seededLine(1)],
			});
			const newer = OrderMother.create({
				userId: "user-other",
				createdAt: "2026-02-15T09:30:00.000Z",
				lines: [seededLine(1)],
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
			await seedUsersProductAndVariant();
			await repository.save(
				OrderMother.create({
					userId: "user-aibuilder",
					lines: [seededLine(3)],
				}),
			);

			const orders = await repository.searchAll();

			expect(orders).toHaveLength(1);
			expect(orders[0].items()).toBe(3);
			expect(orders[0].subtotal.amount).toBe(150);
		});

		it("list orders scoped to a user", async () => {
			await seedUsersProductAndVariant();
			const ownOrder = OrderMother.create({
				userId: "user-aibuilder",
				lines: [seededLine(1)],
			});
			await repository.save(ownOrder);
			await repository.save(
				OrderMother.create({
					userId: "user-other",
					lines: [seededLine(1)],
				}),
			);

			const orders = await repository.searchByUser(
				new UserId("user-aibuilder"),
			);

			expect(orders.map((order) => order.toPrimitives())).toEqual([
				ownOrder.toPrimitives(),
			]);
		});
	},
);
