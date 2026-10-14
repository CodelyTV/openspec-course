import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { UnitOfWork } from "@/contexts/shared/domain/UnitOfWork";
import type { UserId } from "@/contexts/shared/domain/UserId";

import { OrderNotFoundError } from "../../domain/errors/OrderNotFoundError";
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
		const currentUserId = await this.currentUserProvider.currentUserId();

		await this.unitOfWork.run(() => this.cancelOrderOf(id, currentUserId));
	}

	private async cancelOrderOf(id: string, userId: UserId): Promise<void> {
		const order = await this.repository.searchLockingIt(new OrderId(id));
		const belongsToTheUser = order?.userId.equals(userId) ?? false;

		if (!order || !belongsToTheUser) {
			throw new OrderNotFoundError(id);
		}

		if (order.isCancelled()) {
			return;
		}

		await this.stockReleaser.release(order.lines);
		await this.repository.updateStatus(order.cancel());
	}
}
