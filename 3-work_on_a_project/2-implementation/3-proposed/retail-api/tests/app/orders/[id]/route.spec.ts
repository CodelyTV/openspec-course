import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/orders/[id]/route";
import type { OrderFinder } from "@/contexts/backend/orders/application/find/OrderFinder";

import { OrderDetailResponseMother } from "../../../backend/orders/application/find/OrderDetailResponseMother";
import { Mock } from "../../../shared/Mock";

const orderFinder = Mock.create<OrderFinder>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get orderFinder(): OrderFinder {
			return orderFinder;
		},
	},
}));

async function getOrder(id: string): Promise<Response> {
	return GET(new Request(`http://localhost/orders/${id}`), {
		params: Promise.resolve({ id }),
	});
}

describe("GET /orders/{id} should", () => {
	it("respond with the order detail", async () => {
		const order = OrderDetailResponseMother.create();
		orderFinder.findShouldReturn(order);

		const response = await getOrder(order.id);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual(order);
	});

	it("respond 404 with an OrderNotFoundError when the order does not exist", async () => {
		orderFinder.findShouldReturn(null);

		const response = await getOrder("missing");

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({
			error: {
				type: "OrderNotFoundError",
				message: "Order missing not found",
			},
		});
	});
});
