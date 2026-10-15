import { faker } from "@faker-js/faker";

import {
	User,
	type UserPrimitives,
} from "@/contexts/backend/users/domain/User";

export class UserMother {
	static create(overrides: Partial<UserPrimitives> = {}): User {
		return User.fromPrimitives(UserMother.createPrimitives(overrides));
	}

	static createPrimitives(
		overrides: Partial<UserPrimitives> = {},
	): UserPrimitives {
		return {
			id: `user-${faker.string.alphanumeric(8)}`,
			name: faker.person.fullName(),
			email: faker.internet.email(),
			...overrides,
		};
	}
}
