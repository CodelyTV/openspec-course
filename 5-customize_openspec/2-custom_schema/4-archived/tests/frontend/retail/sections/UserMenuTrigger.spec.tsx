import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserMenuTrigger } from "@/contexts/frontend/retail/sections/UserMenuTrigger";

vi.mock("next/navigation", () => ({
	usePathname: vi.fn(),
}));

function menuTrigger(): HTMLElement {
	return screen.getByRole("button", { name: "Ada Lovelace's account" });
}

describe("UserMenuTrigger should", () => {
	beforeEach(() => {
		vi.mocked(usePathname).mockReturnValue("/");
	});

	it("show the user's initials on a closed menu", () => {
		render(<UserMenuTrigger name="Ada Lovelace" email="ada@codely.com" />);

		expect(menuTrigger()).toHaveTextContent("AL");
		expect(menuTrigger()).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByText("ada@codely.com")).not.toBeInTheDocument();
	});

	it("open the menu with the user's details and account links", async () => {
		const user = userEvent.setup();
		render(<UserMenuTrigger name="Ada Lovelace" email="ada@codely.com" />);

		await user.click(menuTrigger());

		expect(menuTrigger()).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText("ada@codely.com")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "My orders" })).toHaveAttribute(
			"href",
			"/account/orders",
		);
		expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute(
			"href",
			"/admin",
		);
	});

	it('show a "Wishlist" link to /account/wishlist after "My orders"', async () => {
		const user = userEvent.setup();
		render(<UserMenuTrigger name="Ada Lovelace" email="ada@codely.com" />);

		await user.click(menuTrigger());

		expect(screen.getByRole("link", { name: "Wishlist" })).toHaveAttribute(
			"href",
			"/account/wishlist",
		);
		expect(
			screen.getAllByRole("link").map((link) => link.textContent),
		).toEqual(["My orders", "Wishlist", "Admin"]);
	});

	it("close the menu when clicking the trigger again", async () => {
		const user = userEvent.setup();
		render(<UserMenuTrigger name="Ada Lovelace" email="ada@codely.com" />);

		await user.click(menuTrigger());
		await user.click(menuTrigger());

		expect(screen.queryByText("ada@codely.com")).not.toBeInTheDocument();
	});

	it("close the menu when pressing Escape", async () => {
		const user = userEvent.setup();
		render(<UserMenuTrigger name="Ada Lovelace" email="ada@codely.com" />);

		await user.click(menuTrigger());
		await user.keyboard("{Escape}");

		expect(screen.queryByText("ada@codely.com")).not.toBeInTheDocument();
	});

	it("close the menu when clicking outside of it", async () => {
		const user = userEvent.setup();
		render(
			<>
				<p>Outside</p>
				<UserMenuTrigger name="Ada Lovelace" email="ada@codely.com" />
			</>,
		);

		await user.click(menuTrigger());
		await user.click(screen.getByText("Outside"));

		expect(screen.queryByText("ada@codely.com")).not.toBeInTheDocument();
	});

	it("close the menu when following one of its links", async () => {
		const user = userEvent.setup();
		render(<UserMenuTrigger name="Ada Lovelace" email="ada@codely.com" />);

		function stayOnThePageBecauseJsdomCannotNavigate(
			event: MouseEvent,
		): void {
			event.preventDefault();
		}
		window.addEventListener(
			"click",
			stayOnThePageBecauseJsdomCannotNavigate,
		);

		await user.click(menuTrigger());
		await user.click(screen.getByRole("link", { name: "My orders" }));

		expect(screen.queryByText("ada@codely.com")).not.toBeInTheDocument();
		window.removeEventListener(
			"click",
			stayOnThePageBecauseJsdomCannotNavigate,
		);
	});

	it("mark the admin link as current inside the admin", async () => {
		const user = userEvent.setup();
		vi.mocked(usePathname).mockReturnValue("/admin/orders");
		render(<UserMenuTrigger name="Ada Lovelace" email="ada@codely.com" />);

		await user.click(menuTrigger());

		expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute(
			"aria-current",
			"page",
		);
	});
});
