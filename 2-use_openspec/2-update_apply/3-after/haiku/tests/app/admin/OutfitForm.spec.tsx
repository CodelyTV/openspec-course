import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createOutfit } from "@/app/actions/outfits/createOutfit";
import { updateOutfit } from "@/app/actions/outfits/updateOutfit";
import { OutfitForm } from "@/app/admin/outfits/OutfitForm";

vi.mock("@/app/actions/outfits/createOutfit", () => ({
	createOutfit: vi.fn(),
}));

vi.mock("@/app/actions/outfits/updateOutfit", () => ({
	updateOutfit: vi.fn(),
}));

const create = vi.mocked(createOutfit);
const update = vi.mocked(updateOutfit);

const products = [
	{ id: "tee", name: "Tee" },
	{ id: "trousers", name: "Trousers" },
	{ id: "jacket", name: "Jacket" },
];

async function fillValidOutfit(
	user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
	await user.type(screen.getByLabelText("Name"), "Weekend Refactor");
	await user.selectOptions(screen.getByLabelText("Piece 1"), "tee");
	await user.selectOptions(screen.getByLabelText("Piece 2"), "trousers");
}

describe("OutfitForm should", () => {
	it("create an outfit with the name and the products picked", async () => {
		const user = userEvent.setup();
		create.mockResolvedValue({ error: null });
		render(<OutfitForm products={products} />);

		await user.type(screen.getByLabelText("Name"), "Weekend Refactor");
		await user.selectOptions(screen.getByLabelText("Piece 1"), "tee");
		await user.selectOptions(screen.getByLabelText("Piece 2"), "trousers");
		await user.click(screen.getByRole("button", { name: "Create outfit" }));

		expect(create).toHaveBeenCalledOnce();
		const formData = create.mock.calls[0][1];
		expect(formData.get("name")).toBe("Weekend Refactor");
		expect(formData.getAll("productIds")).toEqual([
			"tee",
			"trousers",
			"",
			"",
		]);
	});

	it("show why the outfit could not be saved", async () => {
		const user = userEvent.setup();
		create.mockResolvedValue({
			error: "An outfit with that name already exists.",
		});
		render(<OutfitForm products={products} />);

		await fillValidOutfit(user);
		await user.click(screen.getByRole("button", { name: "Create outfit" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"An outfit with that name already exists.",
		);
	});

	it("disable the button while the outfit is being saved", async () => {
		const user = userEvent.setup();
		create.mockReturnValue(new Promise(() => {}));
		render(<OutfitForm products={products} />);

		await fillValidOutfit(user);
		await user.click(screen.getByRole("button", { name: "Create outfit" }));

		expect(
			await screen.findByRole("button", {
				name: "Create outfit",
				busy: true,
			}),
		).toBeDisabled();
	});

	it("prefill an existing outfit and update it", async () => {
		const user = userEvent.setup();
		update.mockResolvedValue({ error: null });
		render(
			<OutfitForm
				products={products}
				outfit={{
					id: "deploy-friday",
					name: "Deploy Friday",
					productIds: ["jacket", "tee"],
				}}
			/>,
		);

		expect(screen.getByLabelText("Name")).toHaveValue("Deploy Friday");
		expect(screen.getByLabelText("Piece 1")).toHaveValue("jacket");

		await user.click(screen.getByRole("button", { name: "Save outfit" }));

		expect(update).toHaveBeenCalledOnce();
		expect(update.mock.calls[0][1].get("outfitId")).toBe("deploy-friday");
	});

	it("require the first two pieces only", () => {
		render(<OutfitForm products={products} />);

		expect(screen.getByLabelText("Piece 1")).toBeRequired();
		expect(screen.getByLabelText("Piece 2")).toBeRequired();
		expect(screen.getByLabelText(/Piece 3/)).not.toBeRequired();
		expect(screen.getByLabelText(/Piece 4/)).not.toBeRequired();
	});
});
