import type { Clock } from "@/contexts/shared/domain/Clock";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { VariantNotFoundError } from "../../domain/errors/VariantNotFoundError";
import type { ProductRepository } from "../../domain/ProductRepository";
import { RestockAlert } from "../../domain/RestockAlert";
import type { RestockAlertRepository } from "../../domain/RestockAlertRepository";

export class RestockAlertRequester {
	constructor(
		private readonly restockAlertRepository: RestockAlertRepository,
		private readonly productRepository: ProductRepository,
		private readonly currentUserProvider: CurrentUserProvider,
		private readonly clock: Clock,
	) {}

	async request(variantId: string): Promise<void> {
		const requestedVariantId = new VariantId(variantId);
		const product =
			await this.productRepository.searchByVariantId(requestedVariantId);

		if (!product) {
			throw new VariantNotFoundError(variantId);
		}

		await this.restockAlertRepository.save(
			new RestockAlert(
				await this.currentUserProvider.currentUserId(),
				requestedVariantId,
				this.clock.now(),
			),
		);
	}
}
