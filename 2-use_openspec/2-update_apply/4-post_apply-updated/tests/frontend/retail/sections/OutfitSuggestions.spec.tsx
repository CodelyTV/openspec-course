import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OutfitSuggestions } from "@/contexts/frontend/retail/sections/OutfitSuggestions";

import { ProductVariantMother } from "../../../backend/products/domain/ProductVariantMother";
import { OutfitSuggestionResponseMother } from "../responses/OutfitSuggestionResponseMother";
import { ProductResponseMother } from "../responses/ProductResponseMother";

const overshirt = ProductResponseMother.create({
	id: "hexagonal-overshirt",
	name: "Hexagonal Overshirt",
});
const tee = ProductResponseMother.create({
	id: "pure-function-tee",
	name: "Pure Function Tee",
});

describe("OutfitSuggestions should", () => {
	it("show each outfit by name with its pieces in order", () => {
		render(
			<OutfitSuggestions
				currentProductId="hexagonal-overshirt"
				outfits={[
					OutfitSuggestionResponseMother.create({
						name: "Deploy Friday",
						products: [tee, overshirt],
					}),
					OutfitSuggestionResponseMother.create({
						name: "Weekend Refactor",
					}),
				]}
			/>,
		);

		const deployFriday = screen.getByRole("article", {
			name: "Deploy Friday",
		});

		expect(
			within(deployFriday)
				.getAllByRole("heading")
				.map((heading) => heading.textContent),
		).toEqual([
			"Deploy Friday",
			"Pure Function Tee",
			"Hexagonal Overshirt",
		]);
		expect(
			screen.getByRole("article", { name: "Weekend Refactor" }),
		).toBeInTheDocument();
	});

	it("mark the product being viewed without linking it and link every other piece", () => {
		render(
			<OutfitSuggestions
				currentProductId="hexagonal-overshirt"
				outfits={[
					OutfitSuggestionResponseMother.create({
						name: "Deploy Friday",
						products: [overshirt, tee],
					}),
				]}
			/>,
		);

		const viewed = screen.getByRole("article", { current: "page" });

		expect(viewed).toHaveTextContent("Hexagonal Overshirt");
		expect(viewed).toHaveTextContent("Viewing");
		expect(within(viewed).queryByRole("link")).not.toBeInTheDocument();
		expect(
			screen
				.getAllByRole("link")
				.map((link) => link.getAttribute("href")),
		).toEqual(["/products/pure-function-tee"]);
	});

	it("show a sold-out piece linking to its product page", () => {
		const soldOutJeans = ProductResponseMother.create({
			id: "merge-conflict-jeans",
			name: "Merge Conflict Jeans",
			variants: [
				ProductVariantMother.createPrimitives({ onlineStock: 0 }),
			],
		});

		render(
			<OutfitSuggestions
				currentProductId="hexagonal-overshirt"
				outfits={[
					OutfitSuggestionResponseMother.create({
						products: [overshirt, soldOutJeans],
					}),
				]}
			/>,
		);

		const jeansLink = screen.getByRole("link", {
			name: /Merge Conflict Jeans/,
		});

		expect(jeansLink).toHaveAttribute(
			"href",
			"/products/merge-conflict-jeans",
		);
		expect(jeansLink).toHaveTextContent("Sold out");
	});
});
