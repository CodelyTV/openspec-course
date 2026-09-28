import { VariantId } from "@/contexts/backend/products/domain/VariantId";
import type { CurrentUserProvider } from "@/contexts/backend/users/domain/CurrentUserProvider";

import type { CheckoutRepository } from "../../domain/CheckoutRepository";

export class CartVariantRemover {
	constructor(
		private readonly checkoutRepository: CheckoutRepository,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async remove(rawVariantId: string): Promise<void> {
		const checkout = await this.checkoutRepository.searchByUser(
			await this.currentUserProvider.currentUserId(),
		);

		if (!checkout) {
			return;
		}

		await this.checkoutRepository.save(
			checkout.removeVariant(new VariantId(rawVariantId)),
		);
	}
}
