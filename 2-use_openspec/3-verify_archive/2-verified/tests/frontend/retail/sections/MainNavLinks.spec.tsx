import { render, screen, within } from "@testing-library/react";
import {
	ReadonlyURLSearchParams,
	usePathname,
	useSearchParams,
} from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MainNavLinks } from "@/contexts/frontend/retail/sections/MainNavLinks";

vi.mock("next/navigation", async (importOriginal) => ({
	...(await importOriginal<typeof import("next/navigation")>()),
	usePathname: vi.fn(),
	useSearchParams: vi.fn(),
}));

function givenTheUserIsOn(url: string): void {
	const { pathname, searchParams } = new URL(url, "http://localhost");
	vi.mocked(usePathname).mockReturnValue(pathname);
	vi.mocked(useSearchParams).mockReturnValue(
		new ReadonlyURLSearchParams(searchParams),
	);
}

describe("MainNavLinks should", () => {
	beforeEach(() => {
		givenTheUserIsOn("/");
	});

	it("link to the catalog and to each collection", () => {
		render(<MainNavLinks collections={["Core", "Summer drop"]} />);

		const links = within(
			screen.getByRole("navigation", { name: "Collections" }),
		).getAllByRole("link");

		expect(
			links.map((link) => [link.textContent, link.getAttribute("href")]),
		).toEqual([
			["Catalog", "/"],
			["Core", "/?collection=Core"],
			["Summer drop", "/?collection=Summer%20drop"],
		]);
	});

	it("mark the catalog as current on the catalog without a collection", () => {
		render(<MainNavLinks collections={["Core"]} />);

		expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(screen.getByRole("link", { name: "Core" })).not.toHaveAttribute(
			"aria-current",
		);
	});

	it("mark the collection being browsed as current", () => {
		givenTheUserIsOn("/?collection=Core");

		render(<MainNavLinks collections={["Core"]} />);

		expect(screen.getByRole("link", { name: "Core" })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(
			screen.getByRole("link", { name: "Catalog" }),
		).not.toHaveAttribute("aria-current");
	});

	it("mark nothing as current outside the catalog", () => {
		givenTheUserIsOn("/checkout");

		render(<MainNavLinks collections={["Core"]} />);

		expect(
			screen.queryByRole("link", { current: "page" }),
		).not.toBeInTheDocument();
	});
});
