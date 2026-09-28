import type { CurrentUserProvider } from "@/contexts/backend/users/domain/CurrentUserProvider";

import type { CheckoutRepository } from "../../domain/CheckoutRepository";

export class CartItemCounter {
	constructor(
		private readonly checkoutRepository: CheckoutRepository,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async count(): Promise<number> {
		const checkout = await this.checkoutRepository.searchByUser(
			await this.currentUserProvider.currentUserId(),
		);

		return checkout ? checkout.itemCount() : 0;
	}
}
