import { describe, expect, it } from "vitest";

import { UsersReviewerDirectory } from "@/contexts/backend/reviews/infrastructure/UsersReviewerDirectory";
import type { UsersByIdsSearcher } from "@/contexts/backend/users/application/search-by-ids/UsersByIdsSearcher";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../shared/Mock";
import { UserMother } from "../../users/domain/UserMother";

describe("UsersReviewerDirectory should", () => {
	const usersByIdsSearcher = Mock.create<UsersByIdsSearcher>();
	const directory = new UsersReviewerDirectory(usersByIdsSearcher);

	it("name each reviewer after its user, falling back to its id when the user is unknown", async () => {
		const ada = UserMother.createPrimitives({ name: "Ada Lovelace" });
		usersByIdsSearcher.searchShouldReturn([ada]);

		const names = await directory.namesOf([
			new UserId(ada.id),
			new UserId("user-gone"),
		]);

		expect(names.nameOf(new UserId(ada.id))).toBe("Ada Lovelace");
		expect(names.nameOf(new UserId("user-gone"))).toBe("user-gone");
	});
});
