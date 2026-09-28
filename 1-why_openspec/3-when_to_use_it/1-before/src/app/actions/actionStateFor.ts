import { CheckoutConcurrentModificationError } from "@/contexts/backend/checkout/domain/errors/CheckoutConcurrentModificationError";
import { EmptyCheckoutError } from "@/contexts/backend/checkout/domain/errors/EmptyCheckoutError";
import { VariantOutOfStockError } from "@/contexts/backend/checkout/domain/errors/VariantOutOfStockError";
import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import { VariantNotFoundError } from "@/contexts/backend/products/domain/errors/VariantNotFoundError";
import { EmptyStringValueObjectError } from "@/contexts/shared/domain/errors/EmptyStringValueObjectError";
import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

import type { ActionState } from "./ActionState";

type ErrorClass = abstract new (...args: never[]) => Error;

const invalidRequestMessage =
	"Something in the request was not valid. Reload the page and try again.";

export type UserFacingMessages = ReadonlyArray<[ErrorClass, string]>;

const userFacingMessages: UserFacingMessages = [
	[VariantOutOfStockError, "There isn't enough stock left for this item."],
	[
		CheckoutConcurrentModificationError,
		"Your cart changed in the meantime. Review it and try again.",
	],
	[
		EmptyCheckoutError,
		"Your cart is empty. Add a product before confirming your order.",
	],
	[ProductNotFoundError, "One of the products is no longer available."],
	[VariantNotFoundError, "The selected variant is no longer available."],
	[InvalidArgumentError, invalidRequestMessage],
	[EmptyStringValueObjectError, invalidRequestMessage],
];

export function actionStateFor(
	error: unknown,
	userFacingMessagesOfThisAction: UserFacingMessages = [],
): ActionState {
	const userFacingMessage = [
		...userFacingMessagesOfThisAction,
		...userFacingMessages,
	].find(([ErrorClass]) => error instanceof ErrorClass)?.[1];

	if (userFacingMessage === undefined) {
		throw error;
	}

	return { error: userFacingMessage };
}
