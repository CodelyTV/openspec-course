import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/orders/recent/route";
import type { RecentOrdersLister } from "@/contexts/backend/orders/application/list-recent/RecentOrdersLister";

import { Mock } from "../../../shared/Mock";

const recentOrdersLister = Mock.create<RecentOrdersLister>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get recentOrdersLister(): RecentOrdersLister {
			return recentOrdersLister;
		},
	},
}));

async function getRecentOrders(query: string): Promise<Response> {
	return GET(
		new Request(`http://localhost/orders/recent${query}`),
		undefined,
	);
}

describe("GET /orders/recent should", () => {
	it("list as many recent orders as the requested limit", async () => {
		recentOrdersLister.listShouldReturn([]);

		const response = await getRecentOrders("?limit=5");

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([]);
		recentOrdersLister.expectListToHaveBeenCalledWith(5);
	});

	it.each(["", "?limit=0", "?limit=-1", "?limit=2.5", "?limit=five"])(
		"respond 400 with an InvalidArgumentError when the limit is not a positive integer (%s)",
		async (query) => {
			const response = await getRecentOrders(query);

			expect(response.status).toBe(400);
			expect((await response.json()).error.type).toBe(
				"InvalidArgumentError",
			);
			recentOrdersLister.expectListNotToHaveBeenCalled();
		},
	);
});
