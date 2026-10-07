import type { CheckoutLine } from "./CheckoutLine";

export abstract class StockReserver {
	abstract reserve(lines: CheckoutLine[]): Promise<void>;
}
