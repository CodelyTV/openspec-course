import { describe, expect, it } from "vitest";

import { UsersByIdsSearcher } from "@/contexts/backend/users/application/search-by-ids/UsersByIdsSearcher";
import type { UserRepository } from "@/contexts/backend/users/domain/UserRepository";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { UserMother } from "../../domain/UserMother";

describe("UsersByIdsSearcher should", () => {
	const userRepository = Mock.create<UserRepository>();
	const searcher = new UsersByIdsSearcher(userRepository);

	it("return the users found for the given ids", async () => {
		const ada = UserMother.create();
		userRepository.searchByIdsShouldReturn([ada]);

		expect(await searcher.search([ada.id.value, "user-ghost"])).toEqual([
			ada.toPrimitives(),
		]);
		userRepository.expectSearchByIdsToHaveBeenCalledWith([
			ada.id,
			new UserId("user-ghost"),
		]);
	});

	it("look up each id only once", async () => {
		userRepository.searchByIdsShouldReturn([]);

		await searcher.search(["user-ada", "user-ada"]);

		userRepository.expectSearchByIdsToHaveBeenCalledWith([
			new UserId("user-ada"),
		]);
	});

	it("return no users without looking them up when no ids are given", async () => {
		expect(await searcher.search([])).toEqual([]);
		userRepository.expectSearchByIdsNotToHaveBeenCalled();
	});
});
