import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { OutfitsTable } from "@/contexts/frontend/retail/sections/OutfitsTable";

it("shows outfit rows and warns only about sold-out pieces", () => {
	render(
		<OutfitsTable
			outfits={[
				{
					id: "a",
					name: "Alpha",
					productCount: 2,
					outOfStockProductNames: [],
				},
				{
					id: "b",
					name: "Beta",
					productCount: 3,
					outOfStockProductNames: ["Tee", "Knit"],
				},
			]}
		/>,
	);
	expect(screen.getByRole("link", { name: "Alpha" })).toHaveAttribute(
		"href",
		"/admin/outfits/a",
	);
	expect(screen.getByRole("link", { name: "Beta" })).toHaveAttribute(
		"href",
		"/admin/outfits/b",
	);
	expect(screen.getByRole("status")).toHaveTextContent("Sold out: Tee, Knit");
	expect(screen.getAllByRole("status")).toHaveLength(1);
});

it("shows an empty state with a creation link", () => {
	render(<OutfitsTable outfits={[]} />);
	expect(screen.queryByRole("table")).not.toBeInTheDocument();
	expect(
		screen.getByRole("link", { name: "Create the first outfit" }),
	).toHaveAttribute("href", "/admin/outfits/new");
});
