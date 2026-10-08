import { parseLiteral } from "./parseLiteral";

export const deliveryMethods = ["home-delivery", "store-pickup"] as const;

export type DeliveryMethod = (typeof deliveryMethods)[number];

export function parseDeliveryMethod(value: string): DeliveryMethod {
	return parseLiteral("delivery method", deliveryMethods, value);
}
