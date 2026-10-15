import type { UserId } from "@/contexts/shared/domain/UserId";

import type { Checkout } from "./Checkout";

export abstract class CheckoutRepository {
	abstract save(checkout: Checkout): Promise<void>;

	abstract searchByUser(userId: UserId): Promise<Checkout | null>;

	abstract searchByUserLockingIt(userId: UserId): Promise<Checkout | null>;
}
