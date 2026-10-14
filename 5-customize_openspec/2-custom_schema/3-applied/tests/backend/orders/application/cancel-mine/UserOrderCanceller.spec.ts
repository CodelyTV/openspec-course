import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserOrderCanceller } from "@/contexts/backend/orders/application/cancel-mine/UserOrderCanceller";
import { OrderNotFoundError } from "@/contexts/backend/orders/domain/errors/OrderNotFoundError";
import { OrderId } from "@/contexts/backend/orders/domain/OrderId";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import type { StockReleaser } from "@/contexts/backend/orders/domain/StockReleaser";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { UnitOfWork } from "@/contexts/shared/domain/UnitOfWork";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
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

	it("cancel a confirmed order of the current customer and release its units", async () => {
		const order = OrderMother.create({
			id: "order-1",
			userId: currentUserId.value,
			status: "confirmed",
		});
		repository.searchLockingItShouldReturn(order);

		await canceller.cancel("order-1");

		repository.expectSearchLockingItToHaveBeenCalledWith(
			new OrderId("order-1"),
		);
		stockReleaser.expectReleaseToHaveBeenCalledWith(order.lines);
		repository.expectUpdateStatusToHaveBeenCalledWith(order.cancel());
	});

	it("do nothing when the order is already cancelled", async () => {
		repository.searchLockingItShouldReturn(
			OrderMother.create({
				userId: currentUserId.value,
				status: "cancelled",
			}),
		);

		await canceller.cancel("order-1");

		stockReleaser.expectReleaseNotToHaveBeenCalled();
		repository.expectUpdateStatusNotToHaveBeenCalled();
	});

	it("fail with order not found when the order belongs to another customer", async () => {
		repository.searchLockingItShouldReturn(
			OrderMother.create({ userId: "user-someone-else" }),
		);

		await expect(canceller.cancel("order-1")).rejects.toEqual(
			new OrderNotFoundError("order-1"),
		);
		stockReleaser.expectReleaseNotToHaveBeenCalled();
		repository.expectUpdateStatusNotToHaveBeenCalled();
	});

	it("fail with order not found when the order does not exist", async () => {
		repository.searchLockingItShouldReturn(null);

		await expect(canceller.cancel("missing")).rejects.toEqual(
			new OrderNotFoundError("missing"),
		);
		stockReleaser.expectReleaseNotToHaveBeenCalled();
		repository.expectUpdateStatusNotToHaveBeenCalled();
	});
});
