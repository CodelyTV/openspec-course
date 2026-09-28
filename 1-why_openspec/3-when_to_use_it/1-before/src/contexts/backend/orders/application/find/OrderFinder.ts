import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import { VariantNotFoundError } from "@/contexts/backend/products/domain/errors/VariantNotFoundError";
import type { Product } from "@/contexts/backend/products/domain/Product";
import { ProductId } from "@/contexts/backend/products/domain/ProductId";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import { VariantId } from "@/contexts/backend/products/domain/VariantId";
import type { UserRepository } from "@/contexts/backend/users/domain/UserRepository";
import type { Currency } from "@/contexts/shared/domain/Money";

import { OrderId } from "../../domain/OrderId";
import type { OrderLine } from "../../domain/OrderLine";
import type { OrderRepository } from "../../domain/OrderRepository";

export type OrderDetailLineResponse = {
	productName: string;
	color: string;
	size: string;
	quantity: number;
	unitPriceAmount: number;
};

export type OrderDetailResponse = {
	id: string;
	userId: string;
	customerName: string;
	createdAt: string;
	status: string;
	deliveryMethod: string;
	subtotalAmount: number;
	currency: Currency;
	lines: OrderDetailLineResponse[];
};

export class OrderFinder {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly productRepository: ProductRepository,
		private readonly userRepository: UserRepository,
	) {}

	async find(id: string): Promise<OrderDetailResponse | null> {
		const isBlankId = id.trim().length === 0;

		if (isBlankId) {
			return null;
		}

		const order = await this.orderRepository.search(new OrderId(id));

		if (!order) {
			return null;
		}

		const orderedProductIds = [
			...new Set(order.lines.map((line) => line.productId)),
		].map((productId) => new ProductId(productId));

		const [products, customer] = await Promise.all([
			this.productRepository.searchByIds(orderedProductIds),
			this.userRepository.search(order.userId),
		]);

		const lines = order.lines
			.map((line) => this.toLineResponse(line, products))
			.sort((a, b) => a.productName.localeCompare(b.productName));

		return {
			id: order.id.value,
			userId: order.userId.value,
			customerName: customer?.name ?? order.userId.value,
			createdAt: order.createdAt.toISOString(),
			status: order.status,
			deliveryMethod: order.deliveryMethod,
			subtotalAmount: order.subtotal.amount,
			currency: order.subtotal.currency,
			lines,
		};
	}

	private toLineResponse(
		line: OrderLine,
		products: Product[],
	): OrderDetailLineResponse {
		const product = products.find(
			(candidate) => candidate.id.value === line.productId,
		);

		if (!product) {
			throw new ProductNotFoundError(line.productId);
		}

		const variant = product.variant(new VariantId(line.variantId));

		if (!variant) {
			throw new VariantNotFoundError(line.variantId);
		}

		return {
			productName: product.name,
			color: variant.color,
			size: variant.size,
			quantity: line.quantity,
			unitPriceAmount: line.unitPrice.amount,
		};
	}
}
