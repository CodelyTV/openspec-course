import { VariantNotFoundError } from "@/contexts/backend/products/domain/errors/VariantNotFoundError";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import { VariantId } from "@/contexts/backend/products/domain/VariantId";
import type { CurrentUserProvider } from "@/contexts/backend/users/domain/CurrentUserProvider";
import type { UserId } from "@/contexts/backend/users/domain/UserId";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";

import { Checkout } from "../../domain/Checkout";
import { CheckoutId } from "../../domain/CheckoutId";
import type { CheckoutRepository } from "../../domain/CheckoutRepository";
import { VariantOutOfStockError } from "../../domain/errors/VariantOutOfStockError";

export class CartVariantAdder {
	constructor(
		private readonly checkoutRepository: CheckoutRepository,
		private readonly productRepository: ProductRepository,
		private readonly currentUserProvider: CurrentUserProvider,
		private readonly idGenerator: IdGenerator,
	) {}

	async add(rawVariantId: string): Promise<void> {
		const variantId = new VariantId(rawVariantId);
		const product =
			await this.productRepository.searchByVariantId(variantId);
		const variant = product?.variant(variantId);

		if (!product || !variant) {
			throw new VariantNotFoundError(variantId.value);
		}

		const checkout = await this.currentUserCheckout();
		const updatedCheckout = checkout.addVariant(
			product.id.value,
			variantId,
		);

		if (!variant.hasStockFor(updatedCheckout.quantityOf(variantId))) {
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
