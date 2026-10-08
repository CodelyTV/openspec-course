import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { removeCartLine } from "@/app/actions/checkout/removeCartLine";
import { RemoveCartLineForm } from "@/app/checkout/RemoveCartLineForm";

vi.mock("@/app/actions/checkout/removeCartLine", () => ({
	removeCartLine: vi.fn(),
}));

const remove = vi.mocked(removeCartLine);

function variantIdSubmitted(): FormDataEntryValue | null {
	const [, formData] = remove.mock.lastCall ?? [];

	return formData?.get("variantId") ?? null;
}

describe("RemoveCartLineForm should", () => {
	const removeButtonName = "Remove Tee Black / M";

	it("remove the line from the cart", async () => {
		const user = userEvent.setup();
		remove.mockResolvedValue({ error: null });
		render(
			<RemoveCartLineForm variantId="tee-m" lineLabel="Tee Black / M" />,
		);

		await user.click(
			screen.getByRole("button", { name: removeButtonName }),
		);

		expect(variantIdSubmitted()).toBe("tee-m");
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("show why the line could not be removed", async () => {
		const user = userEvent.setup();
		remove.mockResolvedValue({
			error: "Your cart changed in the meantime. Review it and try again.",
		});
		render(
			<RemoveCartLineForm variantId="tee-m" lineLabel="Tee Black / M" />,
		);

		await user.click(
			screen.getByRole("button", { name: removeButtonName }),
		);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Your cart changed in the meantime. Review it and try again.",
		);
	});

	it("disable the button while the line is being removed", async () => {
		const user = userEvent.setup();
		remove.mockReturnValue(new Promise(() => {}));
		render(
			<RemoveCartLineForm variantId="tee-m" lineLabel="Tee Black / M" />,
		);

		await user.click(
			screen.getByRole("button", { name: removeButtonName }),
		);

		expect(
			await screen.findByRole("button", {
				name: removeButtonName,
				busy: true,
			}),
		).toBeDisabled();
	});
});
