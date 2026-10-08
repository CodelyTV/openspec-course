import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";
import type { UserId } from "@/contexts/shared/domain/UserId";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { CatalogItems } from "../../domain/CatalogItems";
import { Checkout } from "../../domain/Checkout";
import type { CheckoutCatalog } from "../../domain/CheckoutCatalog";
import { CheckoutId } from "../../domain/CheckoutId";
import type { CheckoutRepository } from "../../domain/CheckoutRepository";
import { VariantOutOfStockError } from "../../domain/errors/VariantOutOfStockError";

export class CartVariantAdder {
	constructor(
		private readonly checkoutRepository: CheckoutRepository,
		private readonly catalog: CheckoutCatalog,
		private readonly currentUserProvider: CurrentUserProvider,
		private readonly idGenerator: IdGenerator,
	) {}

	async add(rawVariantId: string): Promise<void> {
		const variantId = new VariantId(rawVariantId);
		const catalogItems = new CatalogItems(
			await this.catalog.searchItems([variantId]),
		);
		const item = catalogItems.itemOf(variantId);

		const checkout = await this.currentUserCheckout();
		const updatedCheckout = checkout.addVariant(item.productId, variantId);

		if (!item.hasStockFor(updatedCheckout.quantityOf(variantId))) {
			throw new VariantOutOfStockError(variantId.value);
		}

		await this.checkoutRepository.save(updatedCheckout);
	}

	private async currentUserCheckout(): Promise<Checkout> {
		const userId = await this.currentUserProvider.currentUserId();

		return (
			(await this.checkoutRepository.searchByUser(userId)) ??
			this.newCheckoutFor(userId)
		);
	}

	private newCheckoutFor(userId: UserId): Checkout {
		return Checkout.create(
			new CheckoutId(this.idGenerator.generate()),
			userId,
		);
	}
}
