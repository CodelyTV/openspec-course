import type { UserId } from "@/contexts/shared/domain/UserId";

export class CustomerNames {
	constructor(
		private readonly nameByCustomerId: ReadonlyMap<string, string>,
	) {}

	nameOf(customerId: UserId): string {
		return this.nameByCustomerId.get(customerId.value) ?? customerId.value;
	}
}

export abstract class CustomerDirectory {
	abstract namesOf(customerIds: UserId[]): Promise<CustomerNames>;
}
