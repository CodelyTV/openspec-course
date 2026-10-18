import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { addSelectedVariantToCart } from "@/app/actions/checkout/addSelectedVariantToCart";
import { requestRestockAlert } from "@/app/actions/restock-alerts/requestRestockAlert";
import { saveToWishlist } from "@/app/actions/wishlist/saveToWishlist";
import { ProductPurchasePanel } from "@/app/products/[id]/ProductPurchasePanel";

import { ProductVariantMother } from "../../../backend/products/domain/ProductVariantMother";
import { ProductResponseMother } from "../../../frontend/retail/responses/ProductResponseMother";

vi.mock("@/app/actions/checkout/addSelectedVariantToCart", () => ({
	addSelectedVariantToCart: vi.fn(),
}));

vi.mock("@/app/actions/restock-alerts/requestRestockAlert", () => ({
	requestRestockAlert: vi.fn(),
}));

vi.mock("@/app/actions/wishlist/saveToWishlist", () => ({
	saveToWishlist: vi.fn(),
}));

vi.mock("@/app/actions/wishlist/removeFromWishlist", () => ({
	removeFromWishlist: vi.fn(),
}));

const addToCart = vi.mocked(addSelectedVariantToCart);
const notifyMe = vi.mocked(requestRestockAlert);
const save = vi.mocked(saveToWishlist);

const product = ProductResponseMother.create({
	variants: [
		ProductVariantMother.createPrimitives({
			id: "black-s",
			color: "Black",
			size: "S",
			onlineStock: 2,
		}),
		ProductVariantMother.createPrimitives({
			id: "black-m",
			color: "Black",
			size: "M",
			onlineStock: 5,
			measurements: { chest: 104, length: 72 },
		}),
		ProductVariantMother.createPrimitives({
			id: "black-l",
			color: "Black",
			size: "L",
			onlineStock: 0,
		}),
		ProductVariantMother.createPrimitives({
			id: "blue-s",
			color: "Blue",
			size: "S",
			onlineStock: 3,
		}),
		ProductVariantMother.createPrimitives({
			id: "white-m",
			color: "White",
			size: "M",
			onlineStock: 0,
		}),
	],
});

const hexagonalOvershirt = ProductResponseMother.create({
	name: "Hexagonal Overshirt",
	variants: [
		ProductVariantMother.createPrimitives({
			id: "hexagonal-overshirt-moss-s",
			color: "Moss",
			size: "S",
			onlineStock: 3,
		}),
		ProductVariantMother.createPrimitives({
			id: "hexagonal-overshirt-moss-m",
			color: "Moss",
			size: "M",
			onlineStock: 2,
		}),
		ProductVariantMother.createPrimitives({
			id: "hexagonal-overshirt-moss-l",
			color: "Moss",
			size: "L",
			onlineStock: 0,
			measurements: { chest: 116, length: 75 },
		}),
		ProductVariantMother.createPrimitives({
			id: "hexagonal-overshirt-indigo-s",
			color: "Indigo",
			size: "S",
			onlineStock: 4,
		}),
		ProductVariantMother.createPrimitives({
			id: "hexagonal-overshirt-indigo-m",
			color: "Indigo",
			size: "M",
			onlineStock: 1,
		}),
	],
});

const mergeConflictJeans = ProductResponseMother.create({
	name: "Merge Conflict Jeans",
	variants: [
		ProductVariantMother.createPrimitives({
			id: "merge-conflict-jeans-indigo-s",
			color: "Indigo",
			size: "S",
			onlineStock: 0,
		}),
		ProductVariantMother.createPrimitives({
			id: "merge-conflict-jeans-indigo-m",
			color: "Indigo",
			size: "M",
			onlineStock: 0,
		}),
		ProductVariantMother.createPrimitives({
			id: "merge-conflict-jeans-black-m",
			color: "Black",
			size: "M",
			onlineStock: 0,
		}),
	],
});

function selectedVariantSummary(): HTMLElement {
	return screen.getByText(/Online stock:/);
}

function variantIdAddedToCart(): FormDataEntryValue | null {
	const [, formData] = addToCart.mock.lastCall ?? [];

	return formData?.get("variantId") ?? null;
}

describe("ProductPurchasePanel should", () => {
	beforeEach(() => {
		addToCart.mockResolvedValue({ error: null });
		notifyMe.mockResolvedValue({ error: null, isAlertActive: true });
		save.mockResolvedValue({ error: null, isSaved: true });
	});

	it("preselect the first variant in stock", () => {
		render(<ProductPurchasePanel product={product} />);

		expect(screen.getByRole("button", { name: "Black" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		expect(selectedVariantSummary()).toHaveTextContent(
			"Black / S. Online stock: 2",
		);
		expect(
			screen.getByRole("button", { name: "Add to cart" }),
		).toBeEnabled();
	});

	it("show the stock and measurements of the size the user picks", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={product} />);

		await user.click(screen.getByRole("button", { name: "Size M" }));

		expect(screen.getByRole("button", { name: "Size M" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		expect(selectedVariantSummary()).toHaveTextContent(
			"Black / M. Online stock: 5",
		);
		expect(
			screen.getByText("Measurements: chest 104 cm, length 72 cm."),
		).toBeInTheDocument();
	});

	it("offer only the sizes of the selected color", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={product} />);

		await user.click(screen.getByRole("button", { name: "Blue" }));

		expect(
			screen
				.getAllByRole("button", { name: /^Size/ })
				.map((size) => size.textContent),
		).toEqual(["S"]);
	});

	it("keep the chosen size when switching to a color that has it in stock", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={product} />);

		await user.click(screen.getByRole("button", { name: "Blue" }));

		expect(selectedVariantSummary()).toHaveTextContent(
			"Blue / S. Online stock: 3",
		);
	});

	it("pick the first size in stock when the new color lacks the chosen one", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={product} />);

		await user.click(screen.getByRole("button", { name: "Size M" }));
		await user.click(screen.getByRole("button", { name: "Blue" }));

		expect(selectedVariantSummary()).toHaveTextContent(
			"Blue / S. Online stock: 3",
		);
	});

	it("keep sold out sizes and colors selectable", () => {
		render(<ProductPurchasePanel product={mergeConflictJeans} />);

		expect(
			screen.getByRole("button", { name: "Indigo, sold out" }),
		).toBeEnabled();
		expect(
			screen.getByRole("button", { name: "Black, sold out" }),
		).toBeEnabled();
		expect(
			screen.getByRole("button", { name: "Size S, sold out" }),
		).toBeEnabled();
	});

	it("select the first size of a sold out color the user picks", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={mergeConflictJeans} />);

		await user.click(
			screen.getByRole("button", { name: "Black, sold out" }),
		);

		expect(screen.getByText(/^Color:/)).toHaveTextContent("Color: Black");
		expect(selectedVariantSummary()).toHaveTextContent(
			"Black / M. Online stock: 0",
		);
	});

	it("offer every size of the selected color, keeping the sold out ones selectable", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={hexagonalOvershirt} />);

		await user.click(screen.getByRole("button", { name: "Moss" }));

		expect(
			screen
				.getAllByRole("button", { name: /^Size/ })
				.map((size) => size.textContent),
		).toEqual(["S", "M", "L"]);
		expect(
			screen.getByRole("button", { name: "Size L, sold out" }),
		).toBeEnabled();
	});

	it("show the stock and measurements of a sold out size the user picks", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={hexagonalOvershirt} />);

		await user.click(screen.getByRole("button", { name: "Moss" }));
		await user.click(
			screen.getByRole("button", { name: "Size L, sold out" }),
		);

		expect(selectedVariantSummary()).toHaveTextContent(
			"Moss / L. Online stock: 0",
		);
		expect(
			screen.getByText("Measurements: chest 116 cm, length 75 cm."),
		).toBeInTheDocument();
	});

	it("offer a restock alert instead of the add to cart button for a sold out variant", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={hexagonalOvershirt} />);

		await user.click(screen.getByRole("button", { name: "Moss" }));
		await user.click(
			screen.getByRole("button", { name: "Size L, sold out" }),
		);

		expect(
			screen.getByRole("button", { name: "Notify me when it's back" }),
		).toBeEnabled();
		expect(
			screen.queryByRole("button", { name: "Add to cart" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Sold out" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Back to catalog" }),
		).toBeInTheDocument();
	});

	it("open a product with every variant sold out on its first variant, offering a restock alert", () => {
		render(<ProductPurchasePanel product={mergeConflictJeans} />);

		expect(selectedVariantSummary()).toHaveTextContent(
			"Indigo / S. Online stock: 0",
		);
		expect(
			screen.getByRole("button", { name: "Notify me when it's back" }),
		).toBeEnabled();
		expect(
			screen.queryByRole("button", { name: "Add to cart" }),
		).not.toBeInTheDocument();
	});

	it("ask to be notified for the selected sold out variant", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={hexagonalOvershirt} />);

		await user.click(screen.getByRole("button", { name: "Moss" }));
		await user.click(
			screen.getByRole("button", { name: "Size L, sold out" }),
		);
		await user.click(
			screen.getByRole("button", { name: "Notify me when it's back" }),
		);

		expect(notifyMe.mock.lastCall?.[1].get("variantId")).toBe(
			"hexagonal-overshirt-moss-l",
		);
		expect(
			await screen.findByRole("button", { name: "Alert active" }),
		).toBeDisabled();
	});

	it("show the alert as active only for the sold out variant the customer has an alert for", async () => {
		const user = userEvent.setup();
		render(
			<ProductPurchasePanel
				product={mergeConflictJeans}
				alertedVariantIds={["merge-conflict-jeans-black-m"]}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Notify me when it's back" }),
		).toBeEnabled();

		await user.click(
			screen.getByRole("button", { name: "Black, sold out" }),
		);

		expect(selectedVariantSummary()).toHaveTextContent(
			"Black / M. Online stock: 0",
		);
		expect(
			screen.getByRole("button", { name: "Alert active" }),
		).toBeDisabled();
		expect(
			screen.queryByRole("button", { name: "Notify me when it's back" }),
		).not.toBeInTheDocument();
	});

	it("add the selected variant to the cart", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={product} />);

		await user.click(screen.getByRole("button", { name: "Size M" }));
		await user.click(screen.getByRole("button", { name: "Add to cart" }));

		expect(variantIdAddedToCart()).toBe("black-m");
	});

	it("clear the previous error when the user picks another variant", async () => {
		const user = userEvent.setup();
		addToCart.mockResolvedValue({
			error: "There isn't enough stock left for this item.",
		});
		render(<ProductPurchasePanel product={product} />);

		await user.click(screen.getByRole("button", { name: "Add to cart" }));
		await screen.findByRole("alert");
		await user.click(screen.getByRole("button", { name: "Size M" }));

		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("show a product without variants as sold out", () => {
		render(
			<ProductPurchasePanel
				product={ProductResponseMother.create({ variants: [] })}
			/>,
		);

		expect(screen.getByRole("button", { name: "Sold out" })).toBeDisabled();
		expect(
			screen.getByRole("link", { name: "Back to catalog" }),
		).toBeInTheDocument();
	});

	it("keep the wishlist button state when another variant is picked", async () => {
		const user = userEvent.setup();
		render(<ProductPurchasePanel product={hexagonalOvershirt} />);

		await user.click(screen.getByRole("button", { name: "Moss" }));
		await user.click(
			screen.getByRole("button", { name: "Size L, sold out" }),
		);
		await user.click(
			screen.getByRole("button", { name: "Save to wishlist" }),
		);
		await screen.findByRole("button", { name: "Remove from wishlist" });
		await user.click(screen.getByRole("button", { name: "Indigo" }));
		await user.click(screen.getByRole("button", { name: "Size S" }));

		expect(selectedVariantSummary()).toHaveTextContent("Indigo / S");
		expect(
			screen.getByRole("button", { name: "Remove from wishlist" }),
		).toBeEnabled();
	});

	it("offer to save a product without variants to the wishlist", () => {
		render(
			<ProductPurchasePanel
				product={ProductResponseMother.create({ variants: [] })}
				isSaved
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Remove from wishlist" }),
		).toBeEnabled();
	});
});
