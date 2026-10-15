import { RetailApiError } from "@/contexts/frontend/retail/api/RetailApiError";

import type { ActionState } from "./ActionState";
import { InvalidFormDataError } from "./InvalidFormDataError";

type ErrorType = string;

const invalidRequestMessage =
	"Something in the request was not valid. Reload the page and try again.";

export type UserFacingMessages = ReadonlyArray<[ErrorType, string]>;

const userFacingMessages: UserFacingMessages = [
	["VariantOutOfStockError", "There isn't enough stock left for this item."],
	[
		"CheckoutConcurrentModificationError",
		"Your cart changed in the meantime. Review it and try again.",
	],
	[
		"EmptyCheckoutError",
		"Your cart is empty. Add a product before confirming your order.",
	],
	["CatalogItemNotFoundError", "One of the products is no longer available."],
	["InvalidArgumentError", invalidRequestMessage],
	["EmptyStringValueObjectError", invalidRequestMessage],
	["InvalidFormDataError", invalidRequestMessage],
];

function errorTypeOf(error: unknown): ErrorType | undefined {
	if (
		error instanceof RetailApiError ||
		error instanceof InvalidFormDataError
	) {
		return error.type;
	}

	return undefined;
}

export function actionStateFor(
	error: unknown,
	userFacingMessagesOfThisAction: UserFacingMessages = [],
): ActionState {
	const errorType = errorTypeOf(error);
	const userFacingMessage = [
		...userFacingMessagesOfThisAction,
		...userFacingMessages,
	].find(([type]) => type === errorType)?.[1];

	if (userFacingMessage === undefined) {
		throw error;
	}

	return { error: userFacingMessage };
}
