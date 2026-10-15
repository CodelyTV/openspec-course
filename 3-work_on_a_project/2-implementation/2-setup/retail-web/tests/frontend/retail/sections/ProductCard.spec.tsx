import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductCard } from "@/contexts/frontend/retail/sections/ProductCard";

import { ProductResponseMother } from "../responses/ProductResponseMother";
import { ProductVariantResponseMother } from "../responses/ProductVariantResponseMother";

describe("ProductCard should", () => {
	it("link to the product page showing its name, image, price and stock", () => {
		const product = ProductResponseMother.create({
			id: "tee",
			name: "Codely Tee",
			price: { amount: 29, currency: "EUR" },
			variants: [
				ProductVariantResponseMother.create({ onlineStock: 4 }),
				ProductVariantResponseMother.create({ onlineStock: 3 }),
			],
		});

		render(<ProductCard product={product} />);

		const link = screen.getByRole("link");

		expect(link).toHaveAttribute("href", "/products/tee");
		expect(
			screen.getByRole("heading", { name: "Codely Tee" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("img", { name: "Codely Tee" }),
		).toBeInTheDocument();
		expect(link).toHaveTextContent("€29");
		expect(link).toHaveTextContent("7 in stock");
	});

	it("tell when the product is sold out", () => {
		const product = ProductResponseMother.create({
			variants: [ProductVariantResponseMother.create({ onlineStock: 0 })],
		});

		render(<ProductCard product={product} />);

		expect(screen.getByText("Sold out")).toBeInTheDocument();
	});

	it("show its badges", () => {
		const product = ProductResponseMother.create({
			badges: ["New", "Limited edition"],
		});

		render(<ProductCard product={product} />);

		expect(screen.getByText("New")).toBeInTheDocument();
		expect(screen.getByText("Limited edition")).toBeInTheDocument();
	});

	it("describe the available colors, showing four swatches at most", () => {
		const colors = ["Black", "Blue", "Green", "Red", "White"];
		const product = ProductResponseMother.create({
			variants: colors.map((color) =>
				ProductVariantResponseMother.create({ color }),
			),
		});

		render(<ProductCard product={product} />);

		expect(
			screen.getByRole("img", {
				name: "5 colors: Black, Blue, Green, Red, White",
			}),
		).toHaveTextContent("+1");
	});
});
