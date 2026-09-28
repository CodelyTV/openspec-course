import { expect, it } from "vitest";

import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { UserId } from "@/contexts/backend/users/domain/UserId";
import { PostgresUserRepository } from "@/contexts/backend/users/infrastructure/PostgresUserRepository";

import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { UserMother } from "../domain/UserMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresUserRepository(connection);

describeWithEnvironmentArranger(
	arranger,
	"PostgresUserRepository should",
	() => {
		it("find a user by its id", async () => {
			const user = UserMother.create();
			await arranger.givenUsers(user, UserMother.create());

			const found = await repository.search(user.id);

			expect(found?.toPrimitives()).toEqual(user.toPrimitives());
		});

		it("find nothing for an unknown id", async () => {
			await arranger.givenUsers(UserMother.create());

			expect(
				await repository.search(new UserId("user-ghost")),
			).toBeNull();
		});

		it("list every user", async () => {
			const ada = UserMother.create();
			const grace = UserMother.create();
			await arranger.givenUsers(ada, grace);

			const users = await repository.searchAll();

			expect(users.map((user) => user.toPrimitives()).sort(byId)).toEqual(
				[ada.toPrimitives(), grace.toPrimitives()].sort(byId),
			);
		});

		it("list no users when there are none", async () => {
			expect(await repository.searchAll()).toEqual([]);
		});
	},
);

function byId(a: { id: string }, b: { id: string }): number {
	return a.id.localeCompare(b.id);
}
