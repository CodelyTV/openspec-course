import { beforeEach, describe, expect, it } from "vitest";

import type {
	OrderDetailResponse,
	OrderFinder,
} from "@/contexts/backend/orders/application/find/OrderFinder";
import { UserOrderFinder } from "@/contexts/backend/orders/application/find-mine/UserOrderFinder";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { UserId } from "@/contexts/shared/domain/UserId";

import { OrderDetailResponseMother } from "../../../../frontend/retail/responses/OrderDetailResponseMother";
import { Mock } from "../../../../shared/Mock";

describe("UserOrderFinder should", () => {
	const orderFinder = Mock.create<OrderFinder>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const finder = new UserOrderFinder(orderFinder, currentUserProvider);
	const currentUserId = new UserId("user-aibuilder");

	function orderOf(userId: string): OrderDetailResponse {
		return OrderDetailResponseMother.create({ userId });
	}

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(currentUserId);
	});

	it("return an order placed by the current user", async () => {
		const order = orderOf(currentUserId.value);
		orderFinder.findShouldReturn(order);

		expect(await finder.find("order-1")).toEqual(order);
	});

	it("hide an order placed by another user", async () => {
		orderFinder.findShouldReturn(orderOf("user-someone-else"));

		expect(await finder.find("order-1")).toBeNull();
	});

	it("return null when the order does not exist", async () => {
		orderFinder.findShouldReturn(null);

		expect(await finder.find("missing")).toBeNull();
	});
});
