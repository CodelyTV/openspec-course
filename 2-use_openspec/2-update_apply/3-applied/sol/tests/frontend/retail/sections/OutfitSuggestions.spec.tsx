import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { OutfitSuggestions } from "@/contexts/frontend/retail/sections/OutfitSuggestions";

import { OutfitSuggestionResponseMother } from "../responses/OutfitSuggestionResponseMother";

it("marks the viewed piece and links every other piece in outfit order", () => {
	render(
		<OutfitSuggestions
			outfits={[OutfitSuggestionResponseMother.create()]}
			currentProductId="current"
		/>,
	);
	expect(screen.getByText("Complete the look")).toBeInTheDocument();
	expect(
		screen.getByRole("heading", { name: "Weekend Look" }),
	).toBeInTheDocument();
	expect(screen.getByText("Viewing")).toBeInTheDocument();
	expect(
		screen.queryByRole("link", { name: /Current/ }),
	).not.toBeInTheDocument();
	expect(screen.getByRole("link", { name: /Other/ })).toHaveAttribute(
		"href",
		"/products/other",
	);
});
