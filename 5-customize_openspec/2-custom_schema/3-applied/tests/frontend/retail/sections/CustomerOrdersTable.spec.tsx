import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CustomerOrdersTable } from "@/contexts/frontend/retail/sections/CustomerOrdersTable";

import { MyOrderResponseMother } from "../responses/MyOrderResponseMother";

describe("CustomerOrdersTable should", () => {
	it("show each order with its date, delivery, units, status and total", () => {
		const order = MyOrderResponseMother.create({
			id: "order-1",
			createdAt: "2026-03-14T10:00:00.000Z",
			deliveryMethod: "store-pickup",
			items: 3,
			status: "confirmed",
			subtotalAmount: 120,
			currency: "EUR",
		});

		render(<CustomerOrdersTable orders={[order]} />);

		const [, orderRow] = within(
			screen.getByRole("table", { name: "My orders" }),
		).getAllByRole("row");
		const cells = within(orderRow)
			.getAllByRole("cell")
			.map((cell) => cell.textContent);

		expect(cells).toEqual([
			"order-1",
			"14 Mar 2026",
			"Store pickup",
			"3",
			"Confirmed",
			"€120",
		]);
	});

	it("show the cancelled status of a cancelled order", () => {
		render(
			<CustomerOrdersTable
				orders={[MyOrderResponseMother.create({ status: "cancelled" })]}
			/>,
		);

		expect(screen.getByText("Cancelled")).toBeInTheDocument();
	});

	it("link each order to its detail page", () => {
		render(
			<CustomerOrdersTable
				orders={[MyOrderResponseMother.create({ id: "order-1" })]}
			/>,
		);

		expect(screen.getByRole("link", { name: "order-1" })).toHaveAttribute(
			"href",
			"/account/orders/order-1",
		);
	});

	it("show the total in the currency of the order", () => {
		render(
			<CustomerOrdersTable
				orders={[
					MyOrderResponseMother.create({
						subtotalAmount: 45,
						currency: "USD",
					}),
				]}
			/>,
		);

		expect(screen.getByRole("cell", { name: "US$45" })).toBeInTheDocument();
	});

	it("tell the customer when they have not placed any order", () => {
		render(<CustomerOrdersTable orders={[]} />);

		expect(
			screen.getByText("You haven't placed any orders yet."),
		).toBeInTheDocument();
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
	});
});
