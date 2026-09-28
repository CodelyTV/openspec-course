import type {
	OrderPlacer,
	PlaceOrderLine,
} from "@/contexts/backend/orders/application/place/OrderPlacer";
import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import { VariantNotFoundError } from "@/contexts/backend/products/domain/errors/VariantNotFoundError";
import type { Product } from "@/contexts/backend/products/domain/Product";
import { ProductId } from "@/contexts/backend/products/domain/ProductId";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { CurrentUserProvider } from "@/contexts/backend/users/domain/CurrentUserProvider";
import type { UserId } from "@/contexts/backend/users/domain/UserId";
import type { UnitOfWork } from "@/contexts/shared/domain/UnitOfWork";

import type { CheckoutLine } from "../../domain/CheckoutLine";
import type { CheckoutRepository } from "../../domain/CheckoutRepository";
import { EmptyCheckoutError } from "../../domain/errors/EmptyCheckoutError";
import { VariantOutOfStockError } from "../../domain/errors/VariantOutOfStockError";

export class CheckoutConfirmer {
	constructor(
		private readonly checkoutRepository: CheckoutRepository,
		private readonly productRepository: ProductRepository,
		private readonly orderPlacer: OrderPlacer,
		private readonly currentUserProvider: CurrentUserProvider,
		private readonly unitOfWork: UnitOfWork,
	) {}

	async confirm(): Promise<string> {
		const userId = await this.currentUserProvider.currentUserId();

		return this.unitOfWork.run(() => this.confirmCheckoutOf(userId));
	}

	private async confirmCheckoutOf(userId: UserId): Promise<string> {
		const checkout =
			await this.checkoutRepository.searchByUserLockingIt(userId);

		if (!checkout || checkout.isEmpty()) {
			throw new EmptyCheckoutError();
		}

		const products = await this.productRepository.searchByIds(
			checkout.productIds().map((id) => new ProductId(id)),
		);
		const orderLines = checkout.lines.map((line) =>
			this.toOrderLine(line, products),
		);

		await this.decreaseStockOf(checkout.lines);

		const orderId = await this.orderPlacer.place(
			userId,
			checkout.deliveryMethod,
			orderLines,
		);

		await this.checkoutRepository.save(checkout.clear());

		return orderId;
	}

	private toOrderLine(
		line: CheckoutLine,
		products: Product[],
	): PlaceOrderLine {
		const product = products.find(
			(candidate) => candidate.id.value === line.productId,
		);

		if (!product) {
			throw new ProductNotFoundError(line.productId);
		}

		if (!product.variant(line.variantId)) {
			throw new VariantNotFoundError(line.variantId.value);
		}

		return {
			productId: line.productId,
			variantId: line.variantId.value,
			quantity: line.quantity,
			unitPrice: product.price.toPrimitives(),
		};
	}

	private async decreaseStockOf(lines: CheckoutLine[]): Promise<void> {
		const inAStableOrderToAvoidDeadlocksBetweenConcurrentConfirmations = [
			...lines,
		].sort((a, b) => a.variantId.value.localeCompare(b.variantId.value));

		const decreasedPerLine = await Promise.all(
			inAStableOrderToAvoidDeadlocksBetweenConcurrentConfirmations.map(
				(line) =>
					this.productRepository.decreaseStockIfEnoughUnitsLeft(
						line.variantId,
						line.quantity,
					),
			),
		);
		const lineWithoutEnoughStock =
			inAStableOrderToAvoidDeadlocksBetweenConcurrentConfirmations.find(
				(_line, index) => !decreasedPerLine[index],
			);

		if (lineWithoutEnoughStock) {
			throw new VariantOutOfStockError(
				lineWithoutEnoughStock.variantId.value,
			);
		}
	}
}
