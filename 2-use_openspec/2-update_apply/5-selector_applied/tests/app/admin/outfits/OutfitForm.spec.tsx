import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createOutfit } from "@/app/actions/outfits/createOutfit";
import { updateOutfit } from "@/app/actions/outfits/updateOutfit";
import { OutfitForm } from "@/app/admin/outfits/OutfitForm";

import { OutfitResponseMother } from "../../../frontend/retail/responses/OutfitResponseMother";

vi.mock("@/app/actions/outfits/createOutfit", () => ({
	createOutfit: vi.fn(),
}));

vi.mock("@/app/actions/outfits/updateOutfit", () => ({
	updateOutfit: vi.fn(),
}));

const create = vi.mocked(createOutfit);
const update = vi.mocked(updateOutfit);

const products = [
	{ id: "tee", name: "Pure Function Tee" },
	{ id: "chinos", name: "Ubiquitous Chinos" },
	{ id: "jacket", name: "Observability Jacket" },
];

function submittedFields(formData: FormData | undefined): {
	id: FormDataEntryValue | null;
	name: FormDataEntryValue | null;
	productIds: FormDataEntryValue[];
} {
	return {
		id: formData?.get("id") ?? null,
		name: formData?.get("name") ?? null,
		productIds: formData?.getAll("productIds") ?? [],
	};
}

type User = ReturnType<typeof userEvent.setup>;

async function choosePiece(
	user: User,
	piece: string,
	productName: string,
): Promise<void> {
	await user.type(
		screen.getByRole("combobox", { name: piece }),
		productName.slice(0, 4),
	);
	await user.click(screen.getByRole("option", { name: productName }));
}

function chosenPieceNames(): string[] {
	return screen
		.getAllByRole("group", { name: /^Piece \d/ })
		.flatMap((piece) =>
			within(piece)
				.queryAllByRole("img")
				.map((photo) => photo.getAttribute("alt") ?? ""),
		);
}

async function fillInNewOutfit(user: User): Promise<void> {
	await user.type(screen.getByLabelText("Name"), "Deploy Friday");
	await choosePiece(user, "Piece 1", "Observability Jacket");
	await choosePiece(user, "Piece 2", "Pure Function Tee");
}

describe("OutfitForm should", () => {
	it("create an outfit with the name and the chosen pieces in order", async () => {
		const user = userEvent.setup();
		create.mockResolvedValue({ error: null });
		render(<OutfitForm products={products} />);

		await fillInNewOutfit(user);
		await user.click(screen.getByRole("button", { name: "Create outfit" }));

		expect(submittedFields(create.mock.lastCall?.[1])).toEqual({
			id: null,
			name: "Deploy Friday",
			productIds: ["jacket", "tee", "", ""],
		});
	});

	it("save an existing outfit prefilled with its name and pieces", async () => {
		const user = userEvent.setup();
		update.mockResolvedValue({ error: null });
		const outfit = OutfitResponseMother.create({
			id: "outfit-1",
			name: "Deploy Friday",
			productIds: ["chinos", "tee"],
		});
		render(<OutfitForm products={products} outfit={outfit} />);

		expect(chosenPieceNames()).toEqual([
			"Ubiquitous Chinos",
			"Pure Function Tee",
		]);

		await choosePiece(user, "Piece 3 (optional)", "Observability Jacket");
		await user.click(screen.getByRole("button", { name: "Save outfit" }));

		expect(submittedFields(update.mock.lastCall?.[1])).toEqual({
			id: "outfit-1",
			name: "Deploy Friday",
			productIds: ["chinos", "tee", "jacket", ""],
		});
		expect(create).not.toHaveBeenCalled();
	});

	it("show why the outfit could not be saved and keep what was filled in", async () => {
		const user = userEvent.setup();
		create.mockResolvedValue({
			error: "An outfit with that name already exists.",
		});
		render(<OutfitForm products={products} />);

		await fillInNewOutfit(user);
		await user.click(screen.getByRole("button", { name: "Create outfit" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"An outfit with that name already exists.",
		);
		expect(screen.getByLabelText("Name")).toHaveValue("Deploy Friday");
		expect(chosenPieceNames()).toEqual([
			"Observability Jacket",
			"Pure Function Tee",
		]);
	});

	it("disable the button while the outfit is being saved", async () => {
		const user = userEvent.setup();
		create.mockReturnValue(new Promise(() => {}));
		render(<OutfitForm products={products} />);

		await fillInNewOutfit(user);
		await user.click(screen.getByRole("button", { name: "Create outfit" }));

		expect(
			await screen.findByRole("button", {
				name: "Create outfit",
				busy: true,
			}),
		).toBeDisabled();
	});

	it("not let a product chosen in one piece be chosen in another until it is removed", async () => {
		const user = userEvent.setup();
		render(<OutfitForm products={products} />);

		await choosePiece(user, "Piece 1", "Pure Function Tee");
		await user.type(
			screen.getByRole("combobox", { name: "Piece 2" }),
			"tee",
		);

		expect(
			screen.getByRole("option", { name: /Pure Function Tee/ }),
		).toHaveAttribute("aria-disabled", "true");

		await user.click(
			screen.getByRole("button", { name: "Remove Pure Function Tee" }),
		);
		await user.click(screen.getByRole("combobox", { name: "Piece 2" }));
		await user.keyboard("{ArrowDown}");

		expect(
			screen.getByRole("option", { name: "Pure Function Tee" }),
		).not.toHaveAttribute("aria-disabled");
	});
});
