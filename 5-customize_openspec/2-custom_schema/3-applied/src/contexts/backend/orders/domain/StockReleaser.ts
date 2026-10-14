import type { OrderLine } from "./OrderLine";

export abstract class StockReleaser {
	abstract release(lines: OrderLine[]): Promise<void>;
}
