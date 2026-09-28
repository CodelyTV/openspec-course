import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import { VariantNotFoundError } from "@/contexts/backend/products/domain/errors/VariantNotFoundError";
import type { Product } from "@/contexts/backend/products/domain/Product";
import { ProductId } from "@/contexts/backend/products/domain/ProductId";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { CurrentUserProvider } from "@/contexts/backend/users/domain/CurrentUserProvider";
import { Money, type MoneyPrimitives } from "@/contexts/shared/domain/Money";

import type { CheckoutStatus } from "../../domain/Checkout";
import type { CheckoutLine } from "../../domain/CheckoutLine";
import type { CheckoutRepository } from "../../domain/CheckoutRepository";

export type CheckoutLineResponse = {
	variantId: string;
	productName: string;
	color: string;
	size: string;
	quantity: number;
	price: MoneyPrimitives;
	lineTotal: MoneyPrimitives;
};

export type CheckoutResponse = {
	status: string;
	subtotal: MoneyPrimitives | null;
	lines: CheckoutLineResponse[];
};

const statusOfACartNotCreatedYet: CheckoutStatus = "draft";

export class CheckoutViewGetter {
	constructor(
		private readonly checkoutRepository: CheckoutRepository,
		private readonly productRepository: ProductRepository,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async get(): Promise<CheckoutResponse> {
		const userId = await this.currentUserProvider.currentUserId();
		const checkout = await this.checkoutRepository.searchByUser(userId);

		if (!checkout || checkout.isEmpty()) {
			return {
				status: checkout?.status ?? statusOfACartNotCreatedYet,
				subtotal: null,
				lines: [],
			};
		}

		const products = await this.productRepository.searchByIds(
			checkout.productIds().map((id) => new ProductId(id)),
		);
		const lines = checkout.lines
			.map((line) => this.toLineResponse(line, products))
			.sort((a, b) => a.productName.localeCompare(b.productName));

		const subtotal = lines
			.map((line) => Money.fromPrimitives(line.lineTotal))
			.reduce((total, lineTotal) => total.add(lineTotal));

		return {
			status: checkout.status,
			subtotal: subtotal.toPrimitives(),
			lines,
		};
	}

	private toLineResponse(
		line: CheckoutLine,
		products: Product[],
	): CheckoutLineResponse {
		const product = products.find(
			(candidate) => candidate.id.value === line.productId,
		);

		if (!product) {
			throw new ProductNotFoundError(line.productId);
		}

		const variant = product.variant(line.variantId);

		if (!variant) {
			throw new VariantNotFoundError(line.variantId.value);
		}

		return {
			variantId: line.variantId.value,
			productName: product.name,
			color: variant.color,
			size: variant.size,
			quantity: line.quantity,
			price: product.price.toPrimitives(),
			lineTotal: product.price.multiply(line.quantity).toPrimitives(),
		};
	}
}
