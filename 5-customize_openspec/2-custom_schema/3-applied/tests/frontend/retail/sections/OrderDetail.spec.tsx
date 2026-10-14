import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderDetail } from "@/contexts/frontend/retail/sections/OrderDetail";

import {
	OrderDetailLineResponseMother,
	OrderDetailResponseMother,
} from "../responses/OrderDetailResponseMother";

function factShown(label: string): string | null | undefined {
	return screen.getByText(label, { selector: "dt" }).nextElementSibling
		?.textContent;
}

const cancelForm = <button type="button">Cancel order</button>;

function cancelButton(): HTMLElement | null {
	return screen.queryByRole("button", { name: "Cancel order" });
}

describe("OrderDetail should", () => {
	const order = OrderDetailResponseMother.create({
		id: "order-1",
		customerName: "Ada Lovelace",
		createdAt: "2026-03-14T10:00:00.000Z",
		status: "confirmed",
		deliveryMethod: "home-delivery",
		currency: "EUR",
		lines: [
			OrderDetailLineResponseMother.create({
				productName: "Tee",
				color: "Black",
				size: "M",
				quantity: 2,
				unitPriceAmount: 30,
			}),
		],
	});

	it("show the order id as the page title", () => {
		render(<OrderDetail order={order} audience="customer" />);

		expect(
			screen.getByRole("heading", { level: 1, name: "order-1" }),
		).toBeInTheDocument();
	});

	it("show the customer their delivery method, date, status and total", () => {
		render(<OrderDetail order={order} audience="customer" />);

		expect(factShown("Delivery")).toBe("Home delivery");
		expect(factShown("Date")).toBe("14 March 2026");
		expect(factShown("Status")).toBe("Confirmed");
		expect(factShown("Total")).toBe("€60");
		expect(screen.queryByText("Customer")).not.toBeInTheDocument();
	});

	it("show the admin who placed the order instead of the delivery method", () => {
		render(<OrderDetail order={order} audience="admin" />);

		expect(factShown("Customer")).toBe("Ada Lovelace");
		expect(screen.queryByText("Delivery")).not.toBeInTheDocument();
	});

	it("show each line with its variant, units and line total", () => {
		render(<OrderDetail order={order} audience="customer" />);

		const [, lineRow] = within(
			screen.getByRole("table", { name: "Order lines" }),
		).getAllByRole("row");
		const cells = within(lineRow)
			.getAllByRole("cell")
			.map((cell) => cell.textContent);

		expect(cells).toEqual(["Tee", "Black / M", "2", "€60"]);
	});

	it("show amounts in the currency of the order", () => {
		render(
			<OrderDetail
				order={{ ...order, currency: "USD" }}
				audience="customer"
			/>,
		);

		expect(factShown("Total")).toBe("US$60");
		expect(screen.getByRole("cell", { name: "US$60" })).toBeInTheDocument();
	});

	it("show the cancel form to the customer of a confirmed order", () => {
		render(
			<OrderDetail
				order={order}
				audience="customer"
				cancelForm={cancelForm}
			/>,
		);

		expect(cancelButton()).toBeInTheDocument();
	});

	it("show the cancelled status and no cancel form to the customer of a cancelled order", () => {
		render(
			<OrderDetail
				order={{ ...order, status: "cancelled" }}
				audience="customer"
				cancelForm={cancelForm}
			/>,
		);

		expect(factShown("Status")).toBe("Cancelled");
		expect(cancelButton()).not.toBeInTheDocument();
	});

	it("show the cancelled status to admins", () => {
		render(
			<OrderDetail
				order={{ ...order, status: "cancelled" }}
				audience="admin"
			/>,
		);

		expect(factShown("Status")).toBe("Cancelled");
	});

	it("show no cancel form to admins of a confirmed order", () => {
		render(
			<OrderDetail
				order={order}
				audience="admin"
				cancelForm={cancelForm}
			/>,
		);

		expect(factShown("Status")).toBe("Confirmed");
		expect(cancelButton()).not.toBeInTheDocument();
	});

	it("link the customer back to their orders", () => {
		render(<OrderDetail order={order} audience="customer" />);

		expect(
			screen.getByRole("link", { name: "← My orders" }),
		).toHaveAttribute("href", "/account/orders");
	});

	it("link the admin back to every order", () => {
		render(<OrderDetail order={order} audience="admin" />);

		expect(screen.getByRole("link", { name: "← Orders" })).toHaveAttribute(
			"href",
			"/admin/orders",
		);
	});
});
