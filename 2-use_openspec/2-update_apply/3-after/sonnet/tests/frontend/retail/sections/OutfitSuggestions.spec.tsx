import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OutfitSuggestions } from "@/contexts/frontend/retail/sections/OutfitSuggestions";

import { OutfitSuggestionResponseMother } from "../responses/OutfitSuggestionResponseMother";
import { ProductResponseMother } from "../responses/ProductResponseMother";

const overshirt = ProductResponseMother.create({
	id: "overshirt",
	name: "Hexagonal Overshirt",
});
const tee = ProductResponseMother.create({
	id: "tee",
	name: "Pure Function Tee",
});
const jeans = ProductResponseMother.create({
	id: "jeans",
	name: "Merge Conflict Jeans",
});

describe("OutfitSuggestions should", () => {
	it("show every outfit with its name and its pieces in order", () => {
		render(
			<OutfitSuggestions
				currentProductId="overshirt"
				outfits={[
					OutfitSuggestionResponseMother.create({
						name: "Weekend Refactor",
						products: [tee, overshirt, jeans],
					}),
				]}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Weekend Refactor" }),
		).toBeInTheDocument();
		expect(
			screen
				.getAllByRole("heading", { level: 2 })
				.map((heading) => heading.textContent),
		).toEqual([
			"Weekend Refactor",
			"Pure Function Tee",
			"Hexagonal Overshirt",
			"Merge Conflict Jeans",
		]);
	});

	it("mark the product being viewed without linking it", () => {
		render(
			<OutfitSuggestions
				currentProductId="overshirt"
				outfits={[
					OutfitSuggestionResponseMother.create({
						products: [overshirt, tee],
					}),
				]}
			/>,
		);

		expect(screen.getByText("Viewing")).toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: /Hexagonal Overshirt/ }),
		).not.toBeInTheDocument();
	});

	it("link every other piece to its product page", () => {
		render(
			<OutfitSuggestions
				currentProductId="overshirt"
				outfits={[
					OutfitSuggestionResponseMother.create({
						products: [overshirt, tee],
					}),
				]}
			/>,
		);

		expect(
			screen.getByRole("link", { name: /Pure Function Tee/ }),
		).toHaveAttribute("href", "/products/tee");
	});

	it("show the viewed product in each of its outfits", () => {
		render(
			<OutfitSuggestions
				currentProductId="overshirt"
				outfits={[
					OutfitSuggestionResponseMother.create({
						name: "Deploy Friday",
						products: [overshirt, jeans],
					}),
					OutfitSuggestionResponseMother.create({
						name: "Weekend Refactor",
						products: [tee, overshirt],
					}),
				]}
			/>,
		);

		expect(screen.getAllByText("Viewing")).toHaveLength(2);
		const [, secondOutfit] = screen
			.getAllByRole("heading", { level: 2, name: /Friday|Weekend/ })
			.map((heading) => heading.parentElement as HTMLElement);

		expect(
			within(secondOutfit).getByRole("link", {
				name: /Pure Function Tee/,
			}),
		).toBeInTheDocument();
	});
});
