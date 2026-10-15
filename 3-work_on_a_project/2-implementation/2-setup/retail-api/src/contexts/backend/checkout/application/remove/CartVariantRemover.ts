import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { VariantId } from "@/contexts/shared/domain/VariantId";

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
