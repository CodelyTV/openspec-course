import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductOutfits } from "@/contexts/frontend/retail/sections/ProductOutfits";

import { OutfitResponseMother } from "../responses/OutfitResponseMother";
import { ProductResponseMother } from "../responses/ProductResponseMother";

describe("ProductOutfits should", () => {
	it("show pieces in outfit order, mark only the current piece, and retain sold-out products", () => {
		const products = [
			ProductResponseMother.create({ id: "a", name: "Tee" }),
			ProductResponseMother.create({
				id: "b",
				name: "Jeans",
				variants: [],
			}),
		];
		render(
			<ProductOutfits
				outfits={[
					OutfitResponseMother.create({
						name: "Office",
						productIds: ["b", "a"],
					}),
				]}
				products={products}
				currentProductId="a"
			/>,
		);
		const cards = screen.getAllByRole("article");
		expect(
			cards.map((card) => within(card).getByRole("heading").textContent),
		).toEqual(["Jeans", "Tee"]);
		expect(within(cards[0]).getByText("Sold out")).toBeInTheDocument();
		expect(
			within(cards[0]).queryByText("You're viewing this"),
		).not.toBeInTheDocument();
		expect(
			within(cards[1]).getByText("You're viewing this"),
		).toBeInTheDocument();
		expect(within(cards[0]).getByRole("link")).toHaveAttribute(
			"href",
			"/products/b",
		);
	});
	it("show several outfits and skip missing pieces while retaining order", () => {
		const products = [
			ProductResponseMother.create({ id: "a", name: "Tee" }),
			ProductResponseMother.create({ id: "b", name: "Jeans" }),
		];
		render(
			<ProductOutfits
				outfits={[
					OutfitResponseMother.create({
						name: "Office",
						productIds: ["b", "missing", "a"],
					}),
					OutfitResponseMother.create({
						name: "Weekend",
						productIds: ["a", "b"],
					}),
				]}
				products={products}
				currentProductId="a"
			/>,
		);
		expect(
			within(screen.getByRole("region", { name: "Office" }))
				.getAllByRole("article")
				.map((card) => within(card).getByRole("heading").textContent),
		).toEqual(["Jeans", "Tee"]);
		expect(
			within(
				screen.getByRole("region", { name: "Weekend" }),
			).getAllByRole("article"),
		).toHaveLength(2);
		expect(screen.getAllByText("You're viewing this")).toHaveLength(2);
	});
	it("render nothing without outfits", () => {
		const { container } = render(
			<ProductOutfits outfits={[]} products={[]} currentProductId="a" />,
		);
		expect(container).toBeEmptyDOMElement();
	});
});
