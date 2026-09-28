import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { addSelectedVariantToCart } from "@/app/actions/checkout/addSelectedVariantToCart";
import { AddToCartForm } from "@/app/products/[id]/AddToCartForm";

vi.mock("@/app/actions/checkout/addSelectedVariantToCart", () => ({
	addSelectedVariantToCart: vi.fn(),
}));

const addToCart = vi.mocked(addSelectedVariantToCart);

function variantIdSubmitted(): FormDataEntryValue | null {
	const [, formData] = addToCart.mock.lastCall ?? [];

	return formData?.get("variantId") ?? null;
}

describe("AddToCartForm should", () => {
	it("add the variant to the cart", async () => {
		const user = userEvent.setup();
		addToCart.mockResolvedValue({ error: null });
		render(<AddToCartForm variantId="tee-m" hasStock />);

		await user.click(screen.getByRole("button", { name: "Add to cart" }));

		expect(variantIdSubmitted()).toBe("tee-m");
	});

	it("show why the variant could not be added", async () => {
		const user = userEvent.setup();
		addToCart.mockResolvedValue({
			error: "There isn't enough stock left for this item.",
		});
		render(<AddToCartForm variantId="tee-m" hasStock />);

		await user.click(screen.getByRole("button", { name: "Add to cart" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"There isn't enough stock left for this item.",
		);
	});

	it("disable the button while the variant is being added", async () => {
		const user = userEvent.setup();
		addToCart.mockReturnValue(new Promise(() => {}));
		render(<AddToCartForm variantId="tee-m" hasStock />);

		await user.click(screen.getByRole("button", { name: "Add to cart" }));

		expect(
			await screen.findByRole("button", {
				name: "Add to cart",
				busy: true,
			}),
		).toBeDisabled();
	});

	it("not let the user add a sold out variant", () => {
		render(<AddToCartForm variantId="tee-m" hasStock={false} />);

		expect(screen.getByRole("button", { name: "Sold out" })).toBeDisabled();
	});
});
