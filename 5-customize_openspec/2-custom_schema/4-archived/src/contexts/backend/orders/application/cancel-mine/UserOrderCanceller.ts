import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { UnitOfWork } from "@/contexts/shared/domain/UnitOfWork";

import { OrderNotFoundError } from "../../domain/errors/OrderNotFoundError";
import type { Order } from "../../domain/Order";
import { OrderId } from "../../domain/OrderId";
import type { OrderRepository } from "../../domain/OrderRepository";
import type { StockReleaser } from "../../domain/StockReleaser";

export class UserOrderCanceller {
	constructor(
		private readonly repository: OrderRepository,
		private readonly stockReleaser: StockReleaser,
		private readonly currentUserProvider: CurrentUserProvider,
		private readonly unitOfWork: UnitOfWork,
	) {}

	async cancel(id: string): Promise<void> {
		const order = await this.searchOwnOrder(id);

		if (order.isCancelled()) {
			return;
		}

		await this.unitOfWork.run(async () => {
			const movedFromConfirmedToCancelled = await this.repository.cancel(
				order.id,
			);

			if (movedFromConfirmedToCancelled) {
				await this.stockReleaser.release(order.lines);
			}
		});
	}

	private async searchOwnOrder(id: string): Promise<Order> {
		const isBlankId = id.trim().length === 0;

		if (isBlankId) {
			throw new OrderNotFoundError(id);
		}

		const [order, currentUserId] = await Promise.all([
			this.repository.search(new OrderId(id)),
			this.currentUserProvider.currentUserId(),
		]);

		const belongsToCurrentUser = order?.userId.equals(currentUserId);

		if (!order || !belongsToCurrentUser) {
			throw new OrderNotFoundError(id);
		}

		return order;
	}
}
