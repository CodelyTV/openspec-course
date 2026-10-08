import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RecentOrdersPanel } from "@/contexts/frontend/retail/sections/RecentOrdersPanel";

import { OrderResponseMother } from "../responses/OrderResponseMother";

describe("RecentOrdersPanel should", () => {
	it("list each recent order with its day, units and total", () => {
		render(
			<RecentOrdersPanel
				orders={[
					OrderResponseMother.create({
						id: "order-1",
						createdAt: "2026-03-14T10:00:00.000Z",
						items: 3,
						subtotalAmount: 90,
						currency: "USD",
					}),
				]}
			/>,
		);

		const [order] = screen.getAllByRole("listitem");

		expect(order).toHaveTextContent("14 Mar · 3 units");
		expect(order).toHaveTextContent("US$90");
		expect(screen.getByRole("link", { name: "order-1" })).toHaveAttribute(
			"href",
			"/admin/orders/order-1",
		);
	});

	it("tell there are no orders yet", () => {
		render(<RecentOrdersPanel orders={[]} />);

		expect(screen.getByText("No orders yet.")).toBeInTheDocument();
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
	});

	it("link to every order", () => {
		render(<RecentOrdersPanel orders={[]} />);

		expect(
			screen.getByRole("link", { name: "View orders" }),
		).toHaveAttribute("href", "/admin/orders");
	});
});
