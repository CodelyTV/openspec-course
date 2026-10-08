import { CatalogItemNotFoundError } from "@/contexts/backend/checkout/domain/errors/CatalogItemNotFoundError";
import { CheckoutConcurrentModificationError } from "@/contexts/backend/checkout/domain/errors/CheckoutConcurrentModificationError";
import { EmptyCheckoutError } from "@/contexts/backend/checkout/domain/errors/EmptyCheckoutError";
import { VariantOutOfStockError } from "@/contexts/backend/checkout/domain/errors/VariantOutOfStockError";
import { OrderNotFoundError } from "@/contexts/backend/orders/domain/errors/OrderNotFoundError";
import { InvalidOutfitNameError } from "@/contexts/backend/products/domain/errors/InvalidOutfitNameError";
import { InvalidOutfitSizeError } from "@/contexts/backend/products/domain/errors/InvalidOutfitSizeError";
import { OutfitNameAlreadyExistsError } from "@/contexts/backend/products/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitNotFoundError";
import { OutfitProductNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitProductNotFoundError";
import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import { RepeatedOutfitProductError } from "@/contexts/backend/products/domain/errors/RepeatedOutfitProductError";
import { InvalidReviewBodyError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewBodyError";
import { InvalidReviewRatingError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewRatingError";
import { InvalidReviewTitleError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewTitleError";
import { ProductNotPurchasedError } from "@/contexts/backend/reviews/domain/errors/ProductNotPurchasedError";
import { ReviewAlreadyExistsError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyExistsError";
import { ReviewAlreadyModeratedError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyModeratedError";
import { ReviewNotFoundError } from "@/contexts/backend/reviews/domain/errors/ReviewNotFoundError";
import { UserNotFoundError } from "@/contexts/backend/users/domain/errors/UserNotFoundError";
import { EmptyStringValueObjectError } from "@/contexts/shared/domain/errors/EmptyStringValueObjectError";
import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";
import { InvalidLiteralError } from "@/contexts/shared/domain/errors/InvalidLiteralError";
import { InvalidMoneyAmountError } from "@/contexts/shared/domain/errors/InvalidMoneyAmountError";

type ErrorClass = abstract new (...args: never[]) => Error;

type HttpError = [errorClass: ErrorClass, type: string, status: number];

// Types are spelled out because production builds minify class names.
const httpErrors: readonly HttpError[] = [
	[InvalidArgumentError, "InvalidArgumentError", 400],
	[EmptyStringValueObjectError, "EmptyStringValueObjectError", 400],
	[InvalidLiteralError, "InvalidLiteralError", 400],
	[InvalidMoneyAmountError, "InvalidMoneyAmountError", 400],
	[ProductNotPurchasedError, "ProductNotPurchasedError", 403],
	[OutfitNotFoundError, "OutfitNotFoundError", 404],
	[UserNotFoundError, "UserNotFoundError", 404],
	[ProductNotFoundError, "ProductNotFoundError", 404],
	[OrderNotFoundError, "OrderNotFoundError", 404],
	[ReviewNotFoundError, "ReviewNotFoundError", 404],
	[VariantOutOfStockError, "VariantOutOfStockError", 409],
	[
		CheckoutConcurrentModificationError,
		"CheckoutConcurrentModificationError",
		409,
	],
	[EmptyCheckoutError, "EmptyCheckoutError", 409],
	[OutfitNameAlreadyExistsError, "OutfitNameAlreadyExistsError", 409],
	[ReviewAlreadyExistsError, "ReviewAlreadyExistsError", 409],
	[ReviewAlreadyModeratedError, "ReviewAlreadyModeratedError", 409],
	[InvalidOutfitNameError, "InvalidOutfitNameError", 422],
	[InvalidOutfitSizeError, "InvalidOutfitSizeError", 422],
	[RepeatedOutfitProductError, "RepeatedOutfitProductError", 422],
	[OutfitProductNotFoundError, "OutfitProductNotFoundError", 422],
	[CatalogItemNotFoundError, "CatalogItemNotFoundError", 422],
	[InvalidReviewRatingError, "InvalidReviewRatingError", 422],
	[InvalidReviewTitleError, "InvalidReviewTitleError", 422],
	[InvalidReviewBodyError, "InvalidReviewBodyError", 422],
];

function errorResponse(
	type: string,
	message: string,
	status: number,
): Response {
	return Response.json({ error: { type, message } }, { status });
}

export function httpErrorResponse(error: unknown): Response {
	const httpError = httpErrors.find(
		([errorClass]) => error instanceof errorClass,
	);

	if (httpError === undefined || !(error instanceof Error)) {
		console.error(error);

		return errorResponse(
			"InternalServerError",
			"Internal server error",
			500,
		);
	}

	const [, type, status] = httpError;

	return errorResponse(type, error.message, status);
}
