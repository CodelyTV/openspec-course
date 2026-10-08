import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
	{ id: "tee", name: "Pure Function Tee" },
	{ id: "jeans", name: "Merge Conflict Jeans" },
	{ id: "hoodie", name: "Aggregate Hoodie" },
];

async function fillInAnOutfit(
	user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
	await user.type(screen.getByLabelText("Name"), "Weekend Refactor");
	await user.selectOptions(screen.getByLabelText("Product 1"), "tee");
	await user.selectOptions(screen.getByLabelText("Product 2"), "jeans");
}

describe("OutfitForm should", () => {
	beforeEach(() => {
		create.mockReset();
		update.mockReset();
	});

	it("create an outfit with the name and the chosen products in order", async () => {
		const user = userEvent.setup();
		create.mockResolvedValue({ error: null });
		render(<OutfitForm products={products} />);

		await fillInAnOutfit(user);
		await user.selectOptions(screen.getByLabelText("Product 3"), "hoodie");
		await user.click(screen.getByRole("button", { name: "Create outfit" }));

		const [, formData] = create.mock.calls[0];

		expect(formData.get("name")).toBe("Weekend Refactor");
		expect(formData.getAll("productIds")).toEqual([
			"tee",
			"jeans",
			"hoodie",
			"",
		]);
	});

	it("prefill the outfit being edited and save it", async () => {
		const user = userEvent.setup();
		update.mockResolvedValue({ error: null });
		render(
			<OutfitForm
				products={products}
				outfit={{
					id: "outfit-1",
					name: "Deploy Friday",
					productIds: ["jeans", "tee"],
				}}
			/>,
		);

		expect(screen.getByLabelText("Name")).toHaveValue("Deploy Friday");
		expect(screen.getByLabelText("Product 1")).toHaveValue("jeans");
		expect(screen.getByLabelText("Product 2")).toHaveValue("tee");

		await user.click(screen.getByRole("button", { name: "Save outfit" }));

		const [, formData] = update.mock.calls[0];

		expect(formData.get("outfitId")).toBe("outfit-1");
		expect(create).not.toHaveBeenCalled();
	});

	it("ask for at least two products", () => {
		render(<OutfitForm products={products} />);

		expect(screen.getByLabelText("Product 1")).toBeRequired();
		expect(screen.getByLabelText("Product 2")).toBeRequired();
		expect(screen.getByLabelText("Product 3")).not.toBeRequired();
		expect(screen.getByLabelText("Product 4")).not.toBeRequired();
	});

	it("show why the outfit could not be saved", async () => {
		const user = userEvent.setup();
		create.mockResolvedValue({
			error: "An outfit with that name already exists.",
		});
		render(<OutfitForm products={products} />);

		await fillInAnOutfit(user);
		await user.click(screen.getByRole("button", { name: "Create outfit" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"An outfit with that name already exists.",
		);
	});

	it("disable the button while the outfit is being saved", async () => {
		const user = userEvent.setup();
		create.mockReturnValue(new Promise(() => {}));
		render(<OutfitForm products={products} />);

		await fillInAnOutfit(user);
		await user.click(screen.getByRole("button", { name: "Create outfit" }));

		expect(
			await screen.findByRole("button", {
				name: "Create outfit",
				busy: true,
			}),
		).toBeDisabled();
	});
});
