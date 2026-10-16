import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserOrderCanceller } from "@/contexts/backend/orders/application/cancel-mine/UserOrderCanceller";
import { OrderNotFoundError } from "@/contexts/backend/orders/domain/errors/OrderNotFoundError";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import type { StockReleaser } from "@/contexts/backend/orders/domain/StockReleaser";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { UnitOfWork } from "@/contexts/shared/domain/UnitOfWork";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { OrderLineMother } from "../../domain/OrderLineMother";
import { OrderMother } from "../../domain/OrderMother";

describe("UserOrderCanceller should", () => {
	const repository = Mock.create<OrderRepository>();
	const stockReleaser = Mock.create<StockReleaser>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const unitOfWork = Mock.create<UnitOfWork>();
	const canceller = new UserOrderCanceller(
		repository,
		stockReleaser,
		currentUserProvider,
		unitOfWork,
	);
	const currentUserId = new UserId("user-aibuilder");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(currentUserId);
		vi.mocked(unitOfWork.run).mockImplementation((work) => work());
	});

	it("cancel an order placed by the current user and release its lines", async () => {
		const order = OrderMother.create({
			userId: currentUserId.value,
			lines: [
				OrderLineMother.createPrimitives({
					variantId: "a",
					quantity: 1,
				}),
				OrderLineMother.createPrimitives({
					variantId: "b",
					quantity: 2,
				}),
			],
		});
		repository.searchShouldReturn(order);
		repository.cancelShouldReturn(true);

		await canceller.cancel(order.id.value);

		repository.expectCancelToHaveBeenCalledWith(order.id);
		stockReleaser.expectReleaseToHaveBeenCalledWith(order.lines);
	});

	it("cancel an order placed long ago", async () => {
		const order = OrderMother.create({
			userId: currentUserId.value,
			createdAt: "2025-01-01T00:00:00.000Z",
		});
		repository.searchShouldReturn(order);
		repository.cancelShouldReturn(true);

		await canceller.cancel(order.id.value);

		repository.expectCancelToHaveBeenCalledWith(order.id);
		stockReleaser.expectReleaseToHaveBeenCalledWith(order.lines);
	});

	it("cancel and release the stock only within the unit of work", async () => {
		const order = OrderMother.create({ userId: currentUserId.value });
		repository.searchShouldReturn(order);
		vi.mocked(unitOfWork.run).mockResolvedValue(undefined);

		await canceller.cancel(order.id.value);

		repository.expectCancelNotToHaveBeenCalled();
		stockReleaser.expectReleaseNotToHaveBeenCalled();
	});

	it("not release stock when the order was already cancelled", async () => {
		const order = OrderMother.create({ userId: currentUserId.value });
		repository.searchShouldReturn(order);
		repository.cancelShouldReturn(false);

		await canceller.cancel(order.id.value);

		stockReleaser.expectReleaseNotToHaveBeenCalled();
	});

	it("not touch an order it reads as already cancelled", async () => {
		const order = OrderMother.cancelled({ userId: currentUserId.value });
		repository.searchShouldReturn(order);

		await canceller.cancel(order.id.value);

		repository.expectCancelNotToHaveBeenCalled();
		stockReleaser.expectReleaseNotToHaveBeenCalled();
	});

	it("throw not found for an order placed by another user without touching it", async () => {
		const order = OrderMother.create({ userId: "user-someone-else" });
		repository.searchShouldReturn(order);

		await expect(canceller.cancel(order.id.value)).rejects.toBeInstanceOf(
			OrderNotFoundError,
		);
		repository.expectCancelNotToHaveBeenCalled();
		stockReleaser.expectReleaseNotToHaveBeenCalled();
	});

	it("throw not found when the order does not exist", async () => {
		repository.searchShouldReturn(null);

		await expect(canceller.cancel("missing")).rejects.toBeInstanceOf(
			OrderNotFoundError,
		);
		repository.expectCancelNotToHaveBeenCalled();
	});
});
