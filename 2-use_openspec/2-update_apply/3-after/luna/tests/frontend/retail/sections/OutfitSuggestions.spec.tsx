import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OutfitSuggestions } from "@/contexts/frontend/retail/sections/OutfitSuggestions";

import { OutfitSuggestionResponseMother } from "../responses/OutfitSuggestionResponseMother";

describe("OutfitSuggestions", () => {
	it("marks the viewed product and links the other pieces", () => {
		render(
			<OutfitSuggestions
				currentProductId="a"
				outfits={[OutfitSuggestionResponseMother.create()]}
			/>,
		);
		const viewing = screen.getByText("Viewing").closest("article");
		expect(viewing).toHaveTextContent("Hexagonal Overshirt");
		expect(
			within(viewing as HTMLElement).queryByRole("link"),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /Pure Function Tee/ }),
		).toHaveAttribute("href", "/products/b");
	});
});
