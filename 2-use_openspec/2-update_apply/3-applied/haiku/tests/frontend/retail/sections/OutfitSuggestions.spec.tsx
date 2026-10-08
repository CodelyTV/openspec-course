import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OutfitSuggestions } from "@/contexts/frontend/retail/sections/OutfitSuggestions";

import { OutfitSuggestionResponseMother } from "../responses/OutfitSuggestionResponseMother";
import { ProductResponseMother } from "../responses/ProductResponseMother";

const viewed = ProductResponseMother.create({
	id: "hexagonal",
	name: "Hexagonal Overshirt",
});
const tee = ProductResponseMother.create({
	id: "tee",
	name: "Pure Function Tee",
});

describe("OutfitSuggestions should", () => {
	it("show each outfit by name with its pieces in the order the admin set", () => {
		render(
			<OutfitSuggestions
				viewedProductId={viewed.id}
				outfits={[
					OutfitSuggestionResponseMother.create({
						name: "Weekend Refactor",
						products: [tee, viewed],
					}),
					OutfitSuggestionResponseMother.create({
						name: "Deploy Friday",
						products: [viewed],
					}),
				]}
			/>,
		);

		expect(
			screen
				.getAllByRole("heading")
				.map((heading) => heading.textContent),
		).toEqual([
			"Outfits with this piece",
			"Weekend Refactor",
			"Pure Function Tee",
			"Hexagonal Overshirt",
			"Deploy Friday",
			"Hexagonal Overshirt",
		]);
	});

	it("mark the product being viewed without linking to it", () => {
		render(
			<OutfitSuggestions
				viewedProductId={viewed.id}
				outfits={[
					OutfitSuggestionResponseMother.create({
						products: [tee, viewed],
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
				viewedProductId={viewed.id}
				outfits={[
					OutfitSuggestionResponseMother.create({
						products: [tee, viewed],
					}),
				]}
			/>,
		);

		expect(
			screen.getByRole("link", { name: /Pure Function Tee/ }),
		).toHaveAttribute("href", "/products/tee");
		expect(screen.getAllByRole("link")).toHaveLength(1);
	});
});
