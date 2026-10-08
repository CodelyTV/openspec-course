import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createOutfit } from "@/app/actions/outfits/createOutfit";
import { OutfitForm } from "@/app/admin/outfits/OutfitForm";

import { ProductResponseMother } from "../../frontend/retail/responses/ProductResponseMother";

vi.mock("@/app/actions/outfits/createOutfit", () => ({
	createOutfit: vi.fn(),
}));
const create = vi.mocked(createOutfit);
const products = [
	ProductResponseMother.create({ id: "one", name: "One" }),
	ProductResponseMother.create({ id: "two", name: "Two" }),
];

describe("OutfitForm", () => {
	it("submits name and selected products", async () => {
		const user = userEvent.setup();
		create.mockResolvedValue({ error: null });
		render(<OutfitForm products={products} action={createOutfit} />);
		await user.type(screen.getByRole("textbox", { name: /name/i }), "Look");
		const selects = screen.getAllByRole("combobox");
		await user.selectOptions(selects[0], "one");
		await user.selectOptions(selects[1], "two");
		await user.click(screen.getByRole("button", { name: "Save outfit" }));
		const [, data] = create.mock.lastCall ?? [];
		expect(data?.get("name")).toBe("Look");
		expect(data?.getAll("productIds")).toEqual(["one", "two", "", ""]);
	});
	it("shows action errors and disables submit while pending", async () => {
		const user = userEvent.setup();
		create.mockResolvedValue({ error: "That name is already taken." });
		render(<OutfitForm products={products} action={createOutfit} />);
		await user.type(screen.getByRole("textbox", { name: /name/i }), "Look");
		const selects = screen.getAllByRole("combobox");
		await user.selectOptions(selects[0], "one");
		await user.selectOptions(selects[1], "two");
		await user.click(screen.getByRole("button", { name: "Save outfit" }));
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"That name is already taken.",
		);
		create.mockReturnValue(new Promise(() => {}));
		render(<OutfitForm products={products} action={createOutfit} />);
		await user.type(
			screen.getAllByRole("textbox", { name: /name/i })[1],
			"Look",
		);
		const pendingSelects = screen.getAllByRole("combobox").slice(4);
		await user.selectOptions(pendingSelects[0], "one");
		await user.selectOptions(pendingSelects[1], "two");
		await user.click(
			screen.getAllByRole("button", { name: "Save outfit" })[1],
		);
		expect(
			await screen.findByRole("button", { name: "Saving…" }),
		).toBeDisabled();
	});
});
