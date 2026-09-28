import type { DeliveryMethod } from "@/contexts/shared/domain/DeliveryMethod";
import { parseLiteral } from "@/contexts/shared/domain/parseLiteral";
import { UserId } from "@/contexts/shared/domain/UserId";
import type { VariantId } from "@/contexts/shared/domain/VariantId";

import { CheckoutId } from "./CheckoutId";
import { CheckoutLine, type CheckoutLinePrimitives } from "./CheckoutLine";

export const checkoutStatuses = ["draft"] as const;

export type CheckoutStatus = (typeof checkoutStatuses)[number];

export function parseCheckoutStatus(value: string): CheckoutStatus {
	return parseLiteral("checkout status", checkoutStatuses, value);
}

const neverPersistedVersion = 0;

export type CheckoutPrimitives = {
	id: string;
	userId: string;
	deliveryMethod: DeliveryMethod;
	status: CheckoutStatus;
	version: number;
	lines: CheckoutLinePrimitives[];
};

export class Checkout {
	constructor(
		readonly id: CheckoutId,
		readonly userId: UserId,
		readonly deliveryMethod: DeliveryMethod,
		readonly status: CheckoutStatus,
		readonly version: number,
		readonly lines: CheckoutLine[],
	) {}

	static create(id: CheckoutId, userId: UserId): Checkout {
		return new Checkout(
			id,
			userId,
			"home-delivery",
			"draft",
			neverPersistedVersion,
			[],
		);
	}

	static fromPrimitives(primitives: CheckoutPrimitives): Checkout {
		return new Checkout(
			new CheckoutId(primitives.id),
			new UserId(primitives.userId),
			primitives.deliveryMethod,
			primitives.status,
			primitives.version,
			primitives.lines.map(CheckoutLine.fromPrimitives),
		);
	}

	addVariant(productId: string, variantId: VariantId): Checkout {
		const alreadyInCart = this.lines.some((line) => line.isFor(variantId));

		const lines = alreadyInCart
			? this.lines.map((line) =>
					line.isFor(variantId) ? line.withOneMore() : line,
				)
			: [...this.lines, new CheckoutLine(productId, variantId, 1)];

		return this.withLines(lines);
	}

	removeVariant(variantId: VariantId): Checkout {
		return this.withLines(
			this.lines.filter((line) => !line.isFor(variantId)),
		);
	}

	clear(): Checkout {
		return this.withLines([]);
	}

	quantityOf(variantId: VariantId): number {
		return this.lines.find((line) => line.isFor(variantId))?.quantity ?? 0;
	}

	variantIds(): VariantId[] {
		return this.lines.map((line) => line.variantId);
	}

	itemCount(): number {
		return this.lines.reduce((total, line) => total + line.quantity, 0);
	}

	isEmpty(): boolean {
		return this.lines.length === 0;
	}

	hasNeverBeenPersisted(): boolean {
		return this.version === neverPersistedVersion;
	}

	toPrimitives(): CheckoutPrimitives {
		return {
			id: this.id.value,
			userId: this.userId.value,
			deliveryMethod: this.deliveryMethod,
			status: this.status,
			version: this.version,
			lines: this.lines.map((line) => line.toPrimitives()),
		};
	}

	private withLines(lines: CheckoutLine[]): Checkout {
		return new Checkout(
			this.id,
			this.userId,
			this.deliveryMethod,
			this.status,
			this.version,
			lines,
		);
	}
}
