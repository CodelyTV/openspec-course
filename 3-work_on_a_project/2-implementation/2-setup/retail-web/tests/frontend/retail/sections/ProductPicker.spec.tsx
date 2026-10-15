import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { ProductPicker } from "@/contexts/frontend/retail/sections/ProductPicker";

const products = [
	{ id: "tee", name: "Pure Function Tee" },
	{ id: "chinos", name: "Ubiquitous Chinos" },
	{ id: "long-tee", name: "Long Lived TEE" },
	{ id: "jacket", name: "Observability Jacket" },
];

function PickerWithItsChoice({
	initialProductId = "",
	unavailableProductIds = [],
}: {
	initialProductId?: string;
	unavailableProductIds?: string[];
}): React.JSX.Element {
	const [chosenProductId, setChosenProductId] = useState(initialProductId);

	return (
		<form aria-label="Outfit">
			<ProductPicker
				label="Piece 1"
				name="productIds"
				products={products}
				chosenProductId={chosenProductId}
				unavailableProductIds={unavailableProductIds}
				onChoose={setChosenProductId}
			/>
		</form>
	);
}

function submittedProductId(): FormDataEntryValue | null {
	return new FormData(
		screen.getByRole("form", { name: "Outfit" }) as HTMLFormElement,
	).get("productIds");
}

function listedProductNames(): string[] {
	return within(screen.getByRole("listbox"))
		.getAllByRole("option")
		.map((option) => option.textContent);
}

function expectChosen(productName: string): void {
	const piece = screen.getByRole("group", { name: "Piece 1" });

	expect(
		within(piece).getByRole("img", { name: productName }),
	).toBeInTheDocument();
	expect(piece).toHaveTextContent(productName);
	expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
}

describe("ProductPicker should", () => {
	it("list only the products whose name contains the typed text in any case", async () => {
		const user = userEvent.setup();
		render(<PickerWithItsChoice />);

		await user.type(
			screen.getByRole("combobox", { name: "Piece 1" }),
			"tee",
		);

		expect(listedProductNames()).toEqual([
			"Pure Function Tee",
			"Long Lived TEE",
		]);
	});

	it("tell when no product matches the typed text", async () => {
		const user = userEvent.setup();
		render(<PickerWithItsChoice />);

		await user.type(screen.getByRole("combobox"), "hoodie");

		expect(screen.getByText("No products match")).toBeInTheDocument();
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("choose a product by clicking it, showing its photo and name instead of the search", async () => {
		const user = userEvent.setup();
		render(<PickerWithItsChoice />);

		await user.type(screen.getByRole("combobox"), "chinos");
		await user.click(
			screen.getByRole("option", { name: "Ubiquitous Chinos" }),
		);

		expectChosen("Ubiquitous Chinos");
		expect(submittedProductId()).toBe("chinos");
	});

	it("choose the highlighted product with the keyboard, skipping the ones already in the outfit", async () => {
		const user = userEvent.setup();
		render(<PickerWithItsChoice unavailableProductIds={["long-tee"]} />);

		await user.type(screen.getByRole("combobox"), "e");
		await user.keyboard("{ArrowDown}{Enter}");

		expectChosen("Observability Jacket");
		expect(submittedProductId()).toBe("jacket");
	});

	it("list the products already in the outfit as unavailable and ignore clicks on them", async () => {
		const user = userEvent.setup();
		render(<PickerWithItsChoice unavailableProductIds={["tee"]} />);

		await user.type(screen.getByRole("combobox"), "tee");
		const unavailable = screen.getByRole("option", {
			name: /Pure Function Tee/,
		});
		await user.click(unavailable);

		expect(unavailable).toHaveTextContent("Already in this outfit");
		expect(unavailable).toHaveAttribute("aria-disabled", "true");
		expect(screen.getByRole("combobox")).toBeInTheDocument();
		expect(submittedProductId()).toBe("");
	});

	it("close the results with Escape without choosing anything", async () => {
		const user = userEvent.setup();
		render(<PickerWithItsChoice />);

		await user.type(screen.getByRole("combobox"), "tee");
		await user.keyboard("{Escape}");

		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		expect(screen.getByRole("combobox")).toHaveAttribute(
			"aria-expanded",
			"false",
		);
		expect(submittedProductId()).toBe("");
	});

	it("empty the slot when the chosen product is removed so another one can be searched", async () => {
		const user = userEvent.setup();
		render(<PickerWithItsChoice initialProductId="tee" />);

		expectChosen("Pure Function Tee");

		await user.click(screen.getByRole("button", { name: /Remove/ }));

		expect(screen.getByRole("combobox", { name: "Piece 1" })).toHaveFocus();
		expect(submittedProductId()).toBe("");
	});
});
