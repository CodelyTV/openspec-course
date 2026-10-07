import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryFilters } from "@/contexts/frontend/retail/sections/CategoryFilters";

function filters(): HTMLElement {
	return screen.getByRole("navigation", { name: "Filter by garment type" });
}

describe("CategoryFilters should", () => {
	it("offer an 'All' filter followed by one filter per category", () => {
		render(<CategoryFilters categories={["Hoodies", "Tees"]} />);

		expect(
			within(filters())
				.getAllByRole("link")
				.map((link) => link.textContent),
		).toEqual(["All", "Hoodies", "Tees"]);
	});

	it("mark 'All' as current when no category is selected", () => {
		render(<CategoryFilters categories={["Tees"]} />);

		expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(screen.getByRole("link", { name: "Tees" })).not.toHaveAttribute(
			"aria-current",
		);
	});

	it("mark the selected category as current", () => {
		render(
			<CategoryFilters categories={["Tees"]} selectedCategory="Tees" />,
		);

		expect(screen.getByRole("link", { name: "Tees" })).toHaveAttribute(
			"aria-current",
			"page",
		);
	});

	it("keep the selected collection when filtering by category", () => {
		render(
			<CategoryFilters
				categories={["Tees"]}
				selectedCollection="Summer drop"
			/>,
		);

		expect(screen.getByRole("link", { name: "Tees" })).toHaveAttribute(
			"href",
			"/?collection=Summer+drop&category=Tees",
		);
		expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
			"href",
			"/?collection=Summer+drop",
		);
	});

	it("link 'All' to the whole catalog when no collection is selected", () => {
		render(<CategoryFilters categories={[]} />);

		expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
			"href",
			"/",
		);
	});
});
