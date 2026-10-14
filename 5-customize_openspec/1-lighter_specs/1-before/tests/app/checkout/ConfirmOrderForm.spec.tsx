import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { confirmOrder } from "@/app/actions/checkout/confirmOrder";
import { ConfirmOrderForm } from "@/app/checkout/ConfirmOrderForm";

vi.mock("@/app/actions/checkout/confirmOrder", () => ({
	confirmOrder: vi.fn(),
}));

const confirm = vi.mocked(confirmOrder);

describe("ConfirmOrderForm should", () => {
	it("confirm the order", async () => {
		const user = userEvent.setup();
		confirm.mockResolvedValue({ error: null });
		render(<ConfirmOrderForm isCartEmpty={false} />);

		await user.click(screen.getByRole("button", { name: "Confirm order" }));

		expect(confirm).toHaveBeenCalledOnce();
	});

	it("show why the order could not be confirmed", async () => {
		const user = userEvent.setup();
		confirm.mockResolvedValue({
			error: "One of the items in your cart doesn't have enough stock left. Review it and try again.",
		});
		render(<ConfirmOrderForm isCartEmpty={false} />);

		await user.click(screen.getByRole("button", { name: "Confirm order" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"One of the items in your cart doesn't have enough stock left. Review it and try again.",
		);
	});

	it("disable the button while the order is being confirmed", async () => {
		const user = userEvent.setup();
		confirm.mockReturnValue(new Promise(() => {}));
		render(<ConfirmOrderForm isCartEmpty={false} />);

		await user.click(screen.getByRole("button", { name: "Confirm order" }));

		expect(
			await screen.findByRole("button", {
				name: "Confirm order",
				busy: true,
			}),
		).toBeDisabled();
	});

	it("not let the user confirm an empty cart", () => {
		render(<ConfirmOrderForm isCartEmpty />);

		expect(
			screen.getByRole("button", { name: "Confirm order" }),
		).toBeDisabled();
	});
});
