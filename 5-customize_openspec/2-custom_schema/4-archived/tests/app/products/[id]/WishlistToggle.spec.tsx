import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { removeFromWishlist } from "@/app/actions/wishlist/removeFromWishlist";
import { saveToWishlist } from "@/app/actions/wishlist/saveToWishlist";
import { WishlistToggle } from "@/app/products/[id]/WishlistToggle";

vi.mock("@/app/actions/wishlist/saveToWishlist", () => ({
	saveToWishlist: vi.fn(),
}));

vi.mock("@/app/actions/wishlist/removeFromWishlist", () => ({
	removeFromWishlist: vi.fn(),
}));

const save = vi.mocked(saveToWishlist);
const remove = vi.mocked(removeFromWishlist);

function productIdSubmittedTo(
	action: typeof save | typeof remove,
): FormDataEntryValue | null {
	const [, formData] = action.mock.lastCall ?? [];

	return formData?.get("productId") ?? null;
}

describe("WishlistToggle should", () => {
	it('show "Save to wishlist" and switch to "Remove from wishlist" after saving', async () => {
		const user = userEvent.setup();
		save.mockResolvedValue({ error: null, isSaved: true });
		render(
			<WishlistToggle productId="hexagonal-overshirt" isSaved={false} />,
		);

		await user.click(
			screen.getByRole("button", { name: "Save to wishlist" }),
		);

		expect(productIdSubmittedTo(save)).toBe("hexagonal-overshirt");
		expect(
			await screen.findByRole("button", { name: "Remove from wishlist" }),
		).toBeEnabled();
	});

	it('show "Remove from wishlist" and switch to "Save to wishlist" after removing', async () => {
		const user = userEvent.setup();
		remove.mockResolvedValue({ error: null, isSaved: false });
		render(<WishlistToggle productId="event-storm-knit" isSaved />);

		await user.click(
			screen.getByRole("button", { name: "Remove from wishlist" }),
		);

		expect(productIdSubmittedTo(remove)).toBe("event-storm-knit");
		expect(
			await screen.findByRole("button", { name: "Save to wishlist" }),
		).toBeEnabled();
	});

	it('show "This product is no longer available." when the save is rejected', async () => {
		const user = userEvent.setup();
		save.mockResolvedValue({
			error: "This product is no longer available.",
			isSaved: false,
		});
		render(
			<WishlistToggle productId="hexagonal-overshirt" isSaved={false} />,
		);

		await user.click(
			screen.getByRole("button", { name: "Save to wishlist" }),
		);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"This product is no longer available.",
		);
		expect(
			screen.getByRole("button", { name: "Save to wishlist" }),
		).toBeEnabled();
	});

	it("disable the button and show it busy while the request is in progress", async () => {
		const user = userEvent.setup();
		save.mockReturnValue(new Promise(() => {}));
		render(
			<WishlistToggle productId="hexagonal-overshirt" isSaved={false} />,
		);

		await user.click(
			screen.getByRole("button", { name: "Save to wishlist" }),
		);

		expect(
			await screen.findByRole("button", {
				name: "Save to wishlist",
				busy: true,
			}),
		).toBeDisabled();
	});
});
