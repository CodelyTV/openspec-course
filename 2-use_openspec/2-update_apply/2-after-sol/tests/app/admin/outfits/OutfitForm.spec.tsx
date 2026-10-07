import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createOutfit } from "@/app/actions/outfits/createOutfit";
import { outfitFormData } from "@/app/actions/outfits/outfitFormData";
import { updateOutfit } from "@/app/actions/outfits/updateOutfit";
import { OutfitForm } from "@/app/admin/outfits/OutfitForm";

import { OutfitResponseMother } from "../../../frontend/retail/responses/OutfitResponseMother";
import { ProductResponseMother } from "../../../frontend/retail/responses/ProductResponseMother";

vi.mock("@/app/actions/outfits/createOutfit", () => ({
	createOutfit: vi.fn(),
}));
vi.mock("@/app/actions/outfits/updateOutfit", () => ({
	updateOutfit: vi.fn(),
}));
const create = vi.mocked(createOutfit);
const update = vi.mocked(updateOutfit);
const products = [
	ProductResponseMother.create({ id: "a", name: "Tee" }),
	ProductResponseMother.create({ id: "b", name: "Jeans" }),
	ProductResponseMother.create({ id: "c", name: "Shirt" }),
];
describe("OutfitForm should", () => {
	it("submit filled slots in order and ignore empty ones", async () => {
		const user = userEvent.setup();
		create.mockResolvedValue({ error: null });
		render(<OutfitForm products={products} />);
		await user.type(screen.getByLabelText("Name"), "Office");
		await user.selectOptions(screen.getByLabelText("Piece 1"), "b");
		await user.selectOptions(screen.getByLabelText("Piece 2"), "a");
		await user.selectOptions(screen.getByLabelText("Piece 4"), "c");
		await user.click(screen.getByRole("button", { name: "Create outfit" }));
		expect(
			outfitFormData(create.mock.lastCall?.[1] ?? new FormData()),
		).toEqual({
			name: "Office",
			productIds: ["b", "a", "c"],
		});
	});
	it.each([false, true])(
		"preserve entered values on duplicate-name failure (editing: %s)",
		async (editing) => {
			const user = userEvent.setup();
			const action = editing ? update : create;
			action.mockResolvedValue({
				error: "An outfit with this name already exists.",
			});
			render(
				<OutfitForm
					products={products}
					outfit={
						editing
							? OutfitResponseMother.create({
									name: "Previous",
									productIds: ["a", "b"],
								})
							: undefined
					}
				/>,
			);
			await user.clear(screen.getByLabelText("Name"));
			await user.type(screen.getByLabelText("Name"), " office LOOK ");
			await user.selectOptions(screen.getByLabelText("Piece 1"), "c");
			await user.selectOptions(screen.getByLabelText("Piece 4"), "b");
			await user.click(
				screen.getByRole("button", {
					name: editing ? "Save outfit" : "Create outfit",
				}),
			);
			expect(await screen.findByRole("alert")).toHaveTextContent(
				"An outfit with this name already exists.",
			);
			expect(screen.getByLabelText("Name")).toHaveValue(" office LOOK ");
			expect(screen.getByLabelText("Piece 1")).toHaveValue("c");
			expect(screen.getByLabelText("Piece 4")).toHaveValue("b");
		},
	);
	it("show composition errors beside retained values", async () => {
		const user = userEvent.setup();
		create.mockResolvedValue({
			error: "An outfit needs between 2 and 4 products.",
		});
		render(<OutfitForm products={products} />);
		await user.type(screen.getByLabelText("Name"), "Look");
		await user.selectOptions(screen.getByLabelText("Piece 2"), "a");
		await user.click(screen.getByRole("button", { name: "Create outfit" }));
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"An outfit needs between 2 and 4 products.",
		);
		expect(screen.getByLabelText("Name")).toHaveValue("Look");
		expect(screen.getByLabelText("Piece 2")).toHaveValue("a");
	});
	it("pre-fill the name and piece order when editing", () => {
		render(
			<OutfitForm
				products={products}
				outfit={OutfitResponseMother.create({
					name: "Office",
					productIds: ["b", "a", "c"],
				})}
			/>,
		);
		expect(screen.getByLabelText("Name")).toHaveValue("Office");
		expect(screen.getByLabelText("Piece 1")).toHaveValue("b");
		expect(screen.getByLabelText("Piece 2")).toHaveValue("a");
		expect(screen.getByLabelText("Piece 3")).toHaveValue("c");
		expect(screen.getByLabelText("Piece 4")).toHaveValue("");
	});
	it("disable submission while pending", async () => {
		const user = userEvent.setup();
		create.mockReturnValue(new Promise(() => {}));
		render(<OutfitForm products={products} />);
		await user.click(screen.getByRole("button", { name: "Create outfit" }));
		expect(
			await screen.findByRole("button", {
				name: "Create outfit",
				busy: true,
			}),
		).toBeDisabled();
	});
});
