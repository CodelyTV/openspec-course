import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { UnitOfWork } from "@/contexts/shared/domain/UnitOfWork";
import type { UserId } from "@/contexts/shared/domain/UserId";

import { CatalogItems } from "../../domain/CatalogItems";
import type { CheckoutCatalog } from "../../domain/CheckoutCatalog";
import type { CheckoutLine } from "../../domain/CheckoutLine";
import type { CheckoutRepository } from "../../domain/CheckoutRepository";
import { EmptyCheckoutError } from "../../domain/errors/EmptyCheckoutError";
import type {
	OrderPlacement,
	OrderPlacementLine,
} from "../../domain/OrderPlacement";
import type { StockReserver } from "../../domain/StockReserver";

export class CheckoutConfirmer {
	constructor(
		private readonly checkoutRepository: CheckoutRepository,
		private readonly catalog: CheckoutCatalog,
		private readonly stockReserver: StockReserver,
		private readonly orderPlacement: OrderPlacement,
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

		const catalogItems = new CatalogItems(
			await this.catalog.searchItems(checkout.variantIds()),
		);
		const orderLines = checkout.lines.map((line) =>
			this.toOrderLine(line, catalogItems),
		);

		await this.stockReserver.reserve(checkout.lines);

		const orderId = await this.orderPlacement.place(
			userId,
			checkout.deliveryMethod,
			orderLines,
		);

		await this.checkoutRepository.save(checkout.clear());

		return orderId;
	}

	private toOrderLine(
		line: CheckoutLine,
		catalogItems: CatalogItems,
	): OrderPlacementLine {
		const item = catalogItems.itemOf(line.variantId);

		return {
			productId: line.productId,
			variantId: line.variantId,
			productName: item.productName,
			color: item.color,
			size: item.size,
			quantity: line.quantity,
			unitPrice: item.unitPrice,
		};
	}
}
