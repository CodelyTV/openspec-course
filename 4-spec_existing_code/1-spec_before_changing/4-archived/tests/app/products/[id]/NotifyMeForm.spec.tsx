import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { requestRestockAlert } from "@/app/actions/restock-alerts/requestRestockAlert";
import { NotifyMeForm } from "@/app/products/[id]/NotifyMeForm";

vi.mock("@/app/actions/restock-alerts/requestRestockAlert", () => ({
	requestRestockAlert: vi.fn(),
}));

const notifyMe = vi.mocked(requestRestockAlert);

function variantIdSubmitted(): FormDataEntryValue | null {
	const [, formData] = notifyMe.mock.lastCall ?? [];

	return formData?.get("variantId") ?? null;
}

describe("NotifyMeForm should", () => {
	it("ask to be notified when the variant is back and show the alert as active", async () => {
		const user = userEvent.setup();
		notifyMe.mockResolvedValue({ error: null, isAlertActive: true });
		render(<NotifyMeForm variantId="moss-l" hasActiveAlert={false} />);

		await user.click(
			screen.getByRole("button", { name: "Notify me when it's back" }),
		);

		expect(variantIdSubmitted()).toBe("moss-l");
		expect(
			await screen.findByRole("button", { name: "Alert active" }),
		).toBeDisabled();
		expect(
			screen.queryByRole("button", { name: "Notify me when it's back" }),
		).not.toBeInTheDocument();
	});

	it("show a disabled active alert when the customer already has one", () => {
		render(<NotifyMeForm variantId="moss-l" hasActiveAlert />);

		expect(
			screen.getByRole("button", { name: "Alert active" }),
		).toBeDisabled();
		expect(
			screen.queryByRole("button", { name: "Notify me when it's back" }),
		).not.toBeInTheDocument();
	});

	it("show why the alert could not be registered", async () => {
		const user = userEvent.setup();
		notifyMe.mockResolvedValue({
			error: "The selected variant is no longer available.",
			isAlertActive: false,
		});
		render(<NotifyMeForm variantId="moss-l" hasActiveAlert={false} />);

		await user.click(
			screen.getByRole("button", { name: "Notify me when it's back" }),
		);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"The selected variant is no longer available.",
		);
		expect(
			screen.queryByRole("button", { name: "Alert active" }),
		).not.toBeInTheDocument();
	});

	it("disable the button while the request is in progress", async () => {
		const user = userEvent.setup();
		notifyMe.mockReturnValue(new Promise(() => {}));
		render(<NotifyMeForm variantId="moss-l" hasActiveAlert={false} />);

		await user.click(
			screen.getByRole("button", { name: "Notify me when it's back" }),
		);

		expect(
			await screen.findByRole("button", {
				name: "Notify me when it's back",
				busy: true,
			}),
		).toBeDisabled();
	});
});
