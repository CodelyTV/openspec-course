import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminOrdersTable } from "@/contexts/frontend/retail/sections/AdminOrdersTable";

import { OrderResponseMother } from "../responses/OrderResponseMother";

describe("AdminOrdersTable should", () => {
	it("show each order with its customer, date, units, status and total", () => {
		const order = OrderResponseMother.create({
			id: "order-1",
			customerName: "Ada Lovelace",
			createdAt: "2026-03-14T10:00:00.000Z",
			items: 2,
			status: "confirmed",
			subtotalAmount: 99,
			currency: "EUR",
		});

		render(<AdminOrdersTable orders={[order]} />);

		const [, orderRow] = within(
			screen.getByRole("table", { name: "Orders" }),
		).getAllByRole("row");
		const cells = within(orderRow)
			.getAllByRole("cell")
			.map((cell) => cell.textContent);

		expect(cells).toEqual([
			"order-1",
			"Ada Lovelace",
			"14 Mar 2026",
			"2",
			"Confirmed",
			"€99",
		]);
	});

	it("show the cancelled status of a cancelled order", () => {
		render(
			<AdminOrdersTable
				orders={[OrderResponseMother.create({ status: "cancelled" })]}
			/>,
		);

		expect(screen.getByText("Cancelled")).toBeInTheDocument();
	});

	it("link each order to its admin detail page", () => {
		render(
			<AdminOrdersTable
				orders={[OrderResponseMother.create({ id: "order-1" })]}
			/>,
		);

		expect(screen.getByRole("link", { name: "order-1" })).toHaveAttribute(
			"href",
			"/admin/orders/order-1",
		);
	});

	it("show the total in the currency of the order", () => {
		render(
			<AdminOrdersTable
				orders={[
					OrderResponseMother.create({
						subtotalAmount: 45,
						currency: "USD",
					}),
				]}
			/>,
		);

		expect(screen.getByRole("cell", { name: "US$45" })).toBeInTheDocument();
	});

	it("tell the admin when no order has been placed", () => {
		render(<AdminOrdersTable orders={[]} />);

		expect(
			screen.getByText("No orders have been placed yet."),
		).toBeInTheDocument();
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
	});
});
