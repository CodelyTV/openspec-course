import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { addSelectedVariantToCart } from "@/app/actions/checkout/addSelectedVariantToCart";
import { ProductPurchasePanel } from "@/app/products/[id]/ProductPurchasePanel";

import { ProductVariantMother } from "../../../backend/products/domain/ProductVariantMother";
import { ProductResponseMother } from "../../../frontend/retail/responses/ProductResponseMother";

vi.mock("@/app/actions/checkout/addSelectedVariantToCart", () => ({
	addSelectedVariantToCart: vi.fn(),
}));

const addToCart = vi.mocked(addSelectedVariantToCart);

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

	it("not let the user pick a sold out size or color", () => {
		render(<ProductPurchasePanel product={product} />);

		expect(
			screen.getByRole("button", { name: "Size L, sold out" }),
		).toBeDisabled();
		expect(
			screen.getByRole("button", { name: "White, sold out" }),
		).toBeDisabled();
	});

	it("not let the user add a sold out variant to the cart", () => {
		render(
			<ProductPurchasePanel
				product={product}
				initialVariantId="black-l"
			/>,
		);

		expect(screen.getByRole("button", { name: "Sold out" })).toBeDisabled();
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
});
