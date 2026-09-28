import { beforeEach, describe, expect, it } from "vitest";

import { OrderPlacer } from "@/contexts/backend/orders/application/place/OrderPlacer";
import { EmptyOrderError } from "@/contexts/backend/orders/domain/errors/EmptyOrderError";
import { InvalidOrderLineQuantityError } from "@/contexts/backend/orders/domain/errors/InvalidOrderLineQuantityError";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import { UserId } from "@/contexts/backend/users/domain/UserId";
import type { Clock } from "@/contexts/shared/domain/Clock";
import { CurrencyMismatchError } from "@/contexts/shared/domain/errors/CurrencyMismatchError";
import { InvalidMoneyAmountError } from "@/contexts/shared/domain/errors/InvalidMoneyAmountError";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";

import { Mock } from "../../../../shared/Mock";
import { OrderLineMother } from "../../domain/OrderLineMother";
import { OrderMother } from "../../domain/OrderMother";

describe("OrderPlacer should", () => {
	const repository = Mock.create<OrderRepository>();
	const idGenerator = Mock.create<IdGenerator>();
	const clock = Mock.create<Clock>();
	const placer = new OrderPlacer(repository, idGenerator, clock);

	const orderId = "0b6f3c2e-5d1a-4f8e-9a7b-2c4d6e8f0a1b";
	const now = new Date("2026-03-14T10:00:00.000Z");
	const userId = new UserId("user-aibuilder");

	beforeEach(() => {
		idGenerator.generateShouldReturn(orderId);
		clock.nowShouldReturn(now);
	});

	it("place a confirmed order with the subtotal computed from its lines", async () => {
		const lines = [
			OrderLineMother.createPrimitives({
				quantity: 2,
				unitPrice: { amount: 50, currency: "EUR" },
			}),
			OrderLineMother.createPrimitives({
				quantity: 1,
				unitPrice: { amount: 30, currency: "EUR" },
			}),
		];

		const placedOrderId = await placer.place(
			userId,
			"home-delivery",
			lines,
		);

		expect(placedOrderId).toBe(orderId);
		repository.expectSaveToHaveBeenCalledWith(
			OrderMother.create({
				id: orderId,
				userId: userId.value,
				createdAt: now.toISOString(),
				deliveryMethod: "home-delivery",
				status: "confirmed",
				subtotal: { amount: 130, currency: "EUR" },
				lines,
			}),
		);
	});

	it("fail and save nothing when there are no lines", async () => {
		await expect(
			placer.place(userId, "home-delivery", []),
		).rejects.toBeInstanceOf(EmptyOrderError);
		repository.expectSaveNotToHaveBeenCalled();
	});

	it("fail and save nothing when a line has no units", async () => {
		await expect(
			placer.place(userId, "home-delivery", [
				OrderLineMother.createPrimitives({ quantity: 0 }),
			]),
		).rejects.toBeInstanceOf(InvalidOrderLineQuantityError);
		repository.expectSaveNotToHaveBeenCalled();
	});

	it("fail and save nothing when a unit price is negative", async () => {
		await expect(
			placer.place(userId, "home-delivery", [
				OrderLineMother.createPrimitives({
					unitPrice: { amount: -5, currency: "EUR" },
				}),
			]),
		).rejects.toBeInstanceOf(InvalidMoneyAmountError);
		repository.expectSaveNotToHaveBeenCalled();
	});

	it("fail and save nothing when lines are priced in different currencies", async () => {
		await expect(
			placer.place(userId, "home-delivery", [
				OrderLineMother.createPrimitives({
					unitPrice: { amount: 50, currency: "EUR" },
				}),
				OrderLineMother.createPrimitives({
					unitPrice: { amount: 50, currency: "USD" },
				}),
			]),
		).rejects.toBeInstanceOf(CurrencyMismatchError);
		repository.expectSaveNotToHaveBeenCalled();
	});
});
