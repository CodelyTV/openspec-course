import { render, screen, within } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { AdminNav } from "@/app/admin/AdminNav";

vi.mock("next/navigation", () => ({
	usePathname: vi.fn(),
}));

function givenTheUserIsOn(pathname: string): void {
	vi.mocked(usePathname).mockReturnValue(pathname);
}

describe("AdminNav should", () => {
	it("link to every admin panel", () => {
		givenTheUserIsOn("/admin");

		render(<AdminNav />);

		const links = within(
			screen.getByRole("navigation", { name: "Admin panels" }),
		).getAllByRole("link");

		expect(
			links.map((link) => [link.textContent, link.getAttribute("href")]),
		).toEqual([
			["Overview", "/admin"],
			["Orders", "/admin/orders"],
			["Inventory", "/admin/inventory"],
			["Outfits", "/admin/outfits"],
		]);
	});

	it("mark only the overview as current on the overview", () => {
		givenTheUserIsOn("/admin");

		render(<AdminNav />);

		expect(screen.getByRole("link", { current: "page" })).toHaveTextContent(
			"Overview",
		);
	});

	it("mark a panel as current on any of its pages", () => {
		givenTheUserIsOn("/admin/orders/order-1");

		render(<AdminNav />);

		expect(screen.getByRole("link", { current: "page" })).toHaveTextContent(
			"Orders",
		);
	});
	it("mark outfits as current on the edit page", () => {
		givenTheUserIsOn("/admin/outfits/office/edit");
		render(<AdminNav />);
		expect(screen.getByRole("link", { current: "page" })).toHaveTextContent(
			"Outfits",
		);
	});
});
