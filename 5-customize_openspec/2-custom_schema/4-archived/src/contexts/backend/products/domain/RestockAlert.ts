import { UserId } from "@/contexts/shared/domain/UserId";
import { VariantId } from "@/contexts/shared/domain/VariantId";

export type RestockAlertPrimitives = {
	userId: string;
	variantId: string;
	requestedAt: string;
};

export class RestockAlert {
	constructor(
		readonly userId: UserId,
		readonly variantId: VariantId,
		readonly requestedAt: Date,
	) {}

	static fromPrimitives(primitives: RestockAlertPrimitives): RestockAlert {
		return new RestockAlert(
			new UserId(primitives.userId),
			new VariantId(primitives.variantId),
			new Date(primitives.requestedAt),
		);
	}

	toPrimitives(): RestockAlertPrimitives {
		return {
			userId: this.userId.value,
			variantId: this.variantId.value,
			requestedAt: this.requestedAt.toISOString(),
		};
	}
}
