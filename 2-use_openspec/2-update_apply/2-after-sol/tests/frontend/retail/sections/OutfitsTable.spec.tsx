import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { deleteOutfit } from "@/app/actions/outfits/deleteOutfit";
import { OutfitsTable } from "@/contexts/frontend/retail/sections/OutfitsTable";

import { OutfitResponseMother } from "../responses/OutfitResponseMother";

vi.mock("@/app/actions/outfits/deleteOutfit", () => ({
	deleteOutfit: vi.fn(),
}));
const remove = vi.mocked(deleteOutfit);
describe("OutfitsTable should", () => {
	it("list names, piece counts and edit and delete actions", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitResponseMother.create({
						id: "office",
						name: "Office",
						productIds: ["a", "b", "c"],
					}),
					OutfitResponseMother.create({ name: "Weekend" }),
				]}
			/>,
		);
		const rows = within(
			screen.getByRole("table", { name: "Outfits" }),
		).getAllByRole("row");
		expect(rows).toHaveLength(3);
		expect(
			within(rows[1]).getByRole("cell", { name: "3" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Edit Office" }),
		).toHaveAttribute("href", "/admin/outfits/office/edit");
		expect(
			screen.getByRole("button", { name: "Delete Office" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Create outfit" }),
		).toHaveAttribute("href", "/admin/outfits/new");
	});
	it("offer creation in the empty state", () => {
		render(<OutfitsTable outfits={[]} />);
		expect(
			screen.getByText("No outfits have been created yet."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Create outfit" }),
		).toBeInTheDocument();
	});
	it("delete the selected outfit in one action", async () => {
		const user = userEvent.setup();
		remove.mockResolvedValue({ error: null });
		render(
			<OutfitsTable
				outfits={[
					OutfitResponseMother.create({
						id: "office",
						name: "Office",
					}),
				]}
			/>,
		);
		await user.click(screen.getByRole("button", { name: "Delete Office" }));
		expect(remove.mock.lastCall?.[1].get("id")).toBe("office");
	});
});
