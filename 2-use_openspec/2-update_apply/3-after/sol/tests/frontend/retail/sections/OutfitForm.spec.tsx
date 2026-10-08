import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { createOutfit } from "@/app/actions/outfits/outfitActions";
import { OutfitForm } from "@/app/admin/outfits/OutfitForm";

vi.mock("@/app/actions/outfits/outfitActions", () => ({
	createOutfit: vi.fn(),
	updateOutfit: vi.fn(),
	deleteOutfit: vi.fn(),
}));

const products = [
	{ id: "a", name: "Tee" },
	{ id: "b", name: "Knit" },
];

beforeEach(() => {
	vi.mocked(createOutfit).mockReset();
});

function saveForm(): HTMLFormElement {
	const form = screen
		.getByRole("button", { name: "Save outfit" })
		.closest("form");
	if (!form) {
		throw new Error("Save form missing");
	}

	return form;
}

it("submits the name and selected products", async () => {
	vi.mocked(createOutfit).mockResolvedValue({ error: null });
	render(<OutfitForm products={products} />);
	fireEvent.change(screen.getByLabelText("Name"), {
		target: { value: "Weekend" },
	});
	fireEvent.change(screen.getByLabelText("Product 1"), {
		target: { value: "a" },
	});
	fireEvent.change(screen.getByLabelText("Product 2"), {
		target: { value: "b" },
	});
	fireEvent.submit(saveForm());
	await waitFor(() => expect(createOutfit).toHaveBeenCalled());
	const formData = vi.mocked(createOutfit).mock.calls[0][1];
	expect(formData.get("name")).toBe("Weekend");
	expect(formData.getAll("productIds")).toEqual(["a", "b", "", ""]);
});

it("shows the returned error", async () => {
	vi.mocked(createOutfit).mockResolvedValue({ error: "Name already exists" });
	render(<OutfitForm products={products} />);
	fireEvent.submit(saveForm());
	expect(await screen.findByRole("alert")).toHaveTextContent(
		"Name already exists",
	);
});

it("shows a pending state until the action finishes", async () => {
	let finish!: (value: { error: null }) => void;
	vi.mocked(createOutfit).mockImplementation(
		() =>
			new Promise((resolve) => {
				finish = resolve;
			}),
	);
	render(<OutfitForm products={products} />);
	fireEvent.submit(saveForm());
	expect(
		await screen.findByRole("button", { name: "Saving..." }),
	).toBeDisabled();
	finish({ error: null });
	expect(
		await screen.findByRole("button", { name: "Save outfit" }),
	).toBeEnabled();
});
