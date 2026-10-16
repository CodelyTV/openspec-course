import { describe, expect, it } from "vitest";

import { OrderMother } from "./OrderMother";

describe("Order should", () => {
	it("cancel a confirmed order", () => {
		const order = OrderMother.create({ status: "confirmed" });

		const cancelled = order.cancel();

		expect(cancelled.isCancelled()).toBe(true);
		expect(cancelled.toPrimitives()).toEqual({
			...order.toPrimitives(),
			status: "cancelled",
		});
	});

	it("keep an already cancelled order unchanged", () => {
		const order = OrderMother.cancelled();

		expect(order.cancel()).toBe(order);
	});
});
