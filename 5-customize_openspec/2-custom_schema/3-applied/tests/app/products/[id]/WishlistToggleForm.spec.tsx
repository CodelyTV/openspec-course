import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { removeFromWishlist } from "@/app/actions/wishlist/removeFromWishlist";
import { saveToWishlist } from "@/app/actions/wishlist/saveToWishlist";
import { WishlistToggleForm } from "@/app/products/[id]/WishlistToggleForm";

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

describe("WishlistToggleForm should", () => {
	it('show "Save to wishlist" when the product is not saved', () => {
		render(
			<WishlistToggleForm
				productId="domain-event-tee"
				isSavedToWishlist={false}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Save to wishlist" }),
		).toBeEnabled();
		expect(
			screen.queryByRole("button", { name: "Remove from wishlist" }),
		).not.toBeInTheDocument();
	});

	it('show "Remove from wishlist" after saving', async () => {
		const user = userEvent.setup();
		save.mockResolvedValue({ error: null, isSaved: true });
		render(
			<WishlistToggleForm
				productId="merge-conflict-jeans"
				isSavedToWishlist={false}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Save to wishlist" }),
		);

		expect(productIdSubmittedTo(save)).toBe("merge-conflict-jeans");
		expect(
			await screen.findByRole("button", { name: "Remove from wishlist" }),
		).toBeEnabled();
		expect(
			screen.queryByRole("button", { name: "Save to wishlist" }),
		).not.toBeInTheDocument();
	});

	it('show "Remove from wishlist" when initially saved', () => {
		render(
			<WishlistToggleForm
				productId="merge-conflict-jeans"
				isSavedToWishlist
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Remove from wishlist" }),
		).toBeEnabled();
	});

	it('show "Save to wishlist" after removing', async () => {
		const user = userEvent.setup();
		remove.mockResolvedValue({ error: null, isSaved: false });
		render(
			<WishlistToggleForm
				productId="merge-conflict-jeans"
				isSavedToWishlist
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Remove from wishlist" }),
		);

		expect(productIdSubmittedTo(remove)).toBe("merge-conflict-jeans");
		expect(
			await screen.findByRole("button", { name: "Save to wishlist" }),
		).toBeEnabled();
	});

	it("show the error message when saving fails", async () => {
		const user = userEvent.setup();
		save.mockResolvedValue({
			error: "This product is no longer available.",
			isSaved: false,
		});
		render(
			<WishlistToggleForm
				productId="hexagonal-overshirt"
				isSavedToWishlist={false}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Save to wishlist" }),
		);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"This product is no longer available.",
		);
		expect(
			screen.getByRole("button", { name: "Save to wishlist" }),
		).toBeInTheDocument();
	});
	it("disable the button and show it busy while pending", async () => {
		const user = userEvent.setup();
		save.mockReturnValue(new Promise(() => {}));
		render(
			<WishlistToggleForm
				productId="hexagonal-overshirt"
				isSavedToWishlist={false}
			/>,
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
