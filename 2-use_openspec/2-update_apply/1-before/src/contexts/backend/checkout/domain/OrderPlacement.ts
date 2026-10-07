import type { DeliveryMethod } from "@/contexts/shared/domain/DeliveryMethod";
import type { Money } from "@/contexts/shared/domain/Money";
import type { UserId } from "@/contexts/shared/domain/UserId";
import type { VariantId } from "@/contexts/shared/domain/VariantId";

export type OrderPlacementLine = {
	productId: string;
	variantId: VariantId;
	productName: string;
	color: string;
	size: string;
	quantity: number;
	unitPrice: Money;
};

export abstract class OrderPlacement {
	abstract place(
		userId: UserId,
		deliveryMethod: DeliveryMethod,
		lines: OrderPlacementLine[],
	): Promise<string>;
}
