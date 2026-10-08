import { describe, expect, it } from "vitest";

import { UsersReviewAuthors } from "@/contexts/backend/reviews/infrastructure/UsersReviewAuthors";
import type { UsersByIdsSearcher } from "@/contexts/backend/users/application/search-by-ids/UsersByIdsSearcher";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../shared/Mock";
import { UserMother } from "../../users/domain/UserMother";

describe("UsersReviewAuthors should", () => {
	const usersByIdsSearcher = Mock.create<UsersByIdsSearcher>();
	const authors = new UsersReviewAuthors(usersByIdsSearcher);

	it("name the author after its user", async () => {
		const ada = UserMother.createPrimitives({ name: "Ada Lovelace" });
		usersByIdsSearcher.searchShouldReturn([ada]);

		expect(await authors.nameOf(new UserId(ada.id))).toBe("Ada Lovelace");
		usersByIdsSearcher.expectSearchToHaveBeenCalledWith([ada.id]);
	});

	it("fall back to the user id when the user is unknown", async () => {
		usersByIdsSearcher.searchShouldReturn([]);

		expect(await authors.nameOf(new UserId("user-gone"))).toBe("user-gone");
	});
});
