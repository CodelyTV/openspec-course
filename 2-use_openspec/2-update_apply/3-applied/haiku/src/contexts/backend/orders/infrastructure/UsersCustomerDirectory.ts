import type { UsersByIdsSearcher } from "@/contexts/backend/users/application/search-by-ids/UsersByIdsSearcher";
import type { UserId } from "@/contexts/shared/domain/UserId";

import { CustomerDirectory, CustomerNames } from "../domain/CustomerDirectory";

export class UsersCustomerDirectory extends CustomerDirectory {
	constructor(private readonly usersByIdsSearcher: UsersByIdsSearcher) {
		super();
	}

	async namesOf(customerIds: UserId[]): Promise<CustomerNames> {
		const users = await this.usersByIdsSearcher.search(
			customerIds.map((customerId) => customerId.value),
		);

		return new CustomerNames(
			new Map(users.map((user) => [user.id, user.name])),
		);
	}
}
