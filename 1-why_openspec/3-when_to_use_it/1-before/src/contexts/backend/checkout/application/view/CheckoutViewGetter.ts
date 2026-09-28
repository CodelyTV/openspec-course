import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { Money, type MoneyPrimitives } from "@/contexts/shared/domain/Money";

import { CatalogItems } from "../../domain/CatalogItems";
import type { CheckoutStatus } from "../../domain/Checkout";
import type { CheckoutCatalog } from "../../domain/CheckoutCatalog";
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
		private readonly catalog: CheckoutCatalog,
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

		const catalogItems = new CatalogItems(
			await this.catalog.searchItems(checkout.variantIds()),
		);
		const lines = checkout.lines
			.map((line) => this.toLineResponse(line, catalogItems))
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
		catalogItems: CatalogItems,
	): CheckoutLineResponse {
		const item = catalogItems.itemOf(line.variantId);

		return {
			variantId: line.variantId.value,
			productName: item.productName,
			color: item.color,
			size: item.size,
			quantity: line.quantity,
			price: item.unitPrice.toPrimitives(),
			lineTotal: item.unitPrice.multiply(line.quantity).toPrimitives(),
		};
	}
}
