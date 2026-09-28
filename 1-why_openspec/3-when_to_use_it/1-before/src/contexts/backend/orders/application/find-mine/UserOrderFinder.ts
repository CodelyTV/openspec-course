import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";

import type { OrderDetailResponse, OrderFinder } from "../find/OrderFinder";

export class UserOrderFinder {
	constructor(
		private readonly orderFinder: OrderFinder,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async find(id: string): Promise<OrderDetailResponse | null> {
		const [order, currentUserId] = await Promise.all([
			this.orderFinder.find(id),
			this.currentUserProvider.currentUserId(),
		]);

		const belongsToCurrentUser = order?.userId === currentUserId.value;

		return belongsToCurrentUser ? order : null;
	}
}
