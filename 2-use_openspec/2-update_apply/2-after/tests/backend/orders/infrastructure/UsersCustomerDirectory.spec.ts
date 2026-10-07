import { describe, expect, it } from "vitest";

import { UsersCustomerDirectory } from "@/contexts/backend/orders/infrastructure/UsersCustomerDirectory";
import type { UsersByIdsSearcher } from "@/contexts/backend/users/application/search-by-ids/UsersByIdsSearcher";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../shared/Mock";
import { UserMother } from "../../users/domain/UserMother";

describe("UsersCustomerDirectory should", () => {
	const usersByIdsSearcher = Mock.create<UsersByIdsSearcher>();
	const directory = new UsersCustomerDirectory(usersByIdsSearcher);

	it("name each customer after its user, falling back to its id when the user is unknown", async () => {
		const ada = UserMother.createPrimitives({ name: "Ada Lovelace" });
		usersByIdsSearcher.searchShouldReturn([ada]);

		const names = await directory.namesOf([
			new UserId(ada.id),
			new UserId("user-gone"),
		]);

		expect(names.nameOf(new UserId(ada.id))).toBe("Ada Lovelace");
		expect(names.nameOf(new UserId("user-gone"))).toBe("user-gone");
		usersByIdsSearcher.expectSearchToHaveBeenCalledWith([
			ada.id,
			"user-gone",
		]);
	});
});
