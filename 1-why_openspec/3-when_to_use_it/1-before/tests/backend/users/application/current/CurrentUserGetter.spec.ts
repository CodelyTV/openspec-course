import { beforeEach, describe, expect, it } from "vitest";

import { CurrentUserGetter } from "@/contexts/backend/users/application/current/CurrentUserGetter";
import type { CurrentUserProvider } from "@/contexts/backend/users/domain/CurrentUserProvider";
import { UserNotFoundError } from "@/contexts/backend/users/domain/errors/UserNotFoundError";
import type { UserRepository } from "@/contexts/backend/users/domain/UserRepository";

import { Mock } from "../../../../shared/Mock";
import { UserMother } from "../../domain/UserMother";

describe("CurrentUserGetter should", () => {
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const userRepository = Mock.create<UserRepository>();
	const getter = new CurrentUserGetter(currentUserProvider, userRepository);
	const user = UserMother.create();

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(user.id);
	});

	it("return the signed-in user", async () => {
		userRepository.searchShouldReturn(user);

		expect(await getter.get()).toEqual(user.toPrimitives());
	});

	it("fail when the signed-in user does not exist", async () => {
		userRepository.searchShouldReturn(null);

		await expect(getter.get()).rejects.toBeInstanceOf(UserNotFoundError);
	});
});
