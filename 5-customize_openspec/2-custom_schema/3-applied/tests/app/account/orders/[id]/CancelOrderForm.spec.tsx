import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CancelOrderForm } from "@/app/account/orders/[id]/CancelOrderForm";
import { cancelOrder } from "@/app/actions/orders/cancelOrder";

vi.mock("@/app/actions/orders/cancelOrder", () => ({
	cancelOrder: vi.fn(),
}));

const cancel = vi.mocked(cancelOrder);

function orderIdSubmitted(): FormDataEntryValue | null {
	const [, formData] = cancel.mock.lastCall ?? [];

	return formData?.get("orderId") ?? null;
}

describe("CancelOrderForm should", () => {
	it("send the order id when clicking Cancel order", async () => {
		const user = userEvent.setup();
		cancel.mockResolvedValue({ error: null });
		render(<CancelOrderForm orderId="order-1" />);

		await user.click(screen.getByRole("button", { name: "Cancel order" }));

		expect(orderIdSubmitted()).toBe("order-1");
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("show the error when the order was not found", async () => {
		const user = userEvent.setup();
		cancel.mockResolvedValue({ error: "This order was not found." });
		render(<CancelOrderForm orderId="order-1" />);

		await user.click(screen.getByRole("button", { name: "Cancel order" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"This order was not found.",
		);
	});

	it("disable the button while cancelling", async () => {
		const user = userEvent.setup();
		cancel.mockReturnValue(new Promise(() => {}));
		render(<CancelOrderForm orderId="order-1" />);

		await user.click(screen.getByRole("button", { name: "Cancel order" }));

		expect(
			await screen.findByRole("button", {
				name: "Cancel order",
				busy: true,
			}),
		).toBeDisabled();
	});
});
