import { CodelyError } from "@/contexts/shared/domain/CodelyError";

import type { CheckoutId } from "../CheckoutId";

export class CheckoutConcurrentModificationError extends CodelyError {
	constructor(checkoutId: CheckoutId) {
		super(
			`Checkout ${checkoutId.value} was modified concurrently, reload it and try again`,
		);
	}
}
