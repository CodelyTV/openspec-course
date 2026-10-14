import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { deleteOutfit } from "@/app/actions/outfits/deleteOutfit";
import { DeleteOutfitForm } from "@/app/admin/outfits/DeleteOutfitForm";

vi.mock("@/app/actions/outfits/deleteOutfit", () => ({
	deleteOutfit: vi.fn(),
}));

const remove = vi.mocked(deleteOutfit);

describe("DeleteOutfitForm should", () => {
	it("delete the outfit", async () => {
		const user = userEvent.setup();
		remove.mockResolvedValue({ error: null });
		render(<DeleteOutfitForm outfitId="outfit-1" />);

		await user.click(screen.getByRole("button", { name: "Delete outfit" }));

		expect(remove.mock.lastCall?.[1].get("id")).toBe("outfit-1");
	});

	it("show why the outfit could not be deleted", async () => {
		const user = userEvent.setup();
		remove.mockResolvedValue({ error: "This outfit no longer exists." });
		render(<DeleteOutfitForm outfitId="outfit-1" />);

		await user.click(screen.getByRole("button", { name: "Delete outfit" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"This outfit no longer exists.",
		);
	});
});
