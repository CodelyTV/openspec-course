"use server";

import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { actionStateFor, type UserFacingMessages } from "../actionStateFor";

import { requiredProductId } from "./requiredProductId";
import { revalidateWishlistPages } from "./revalidateWishlistPages";
import type { WishlistActionState } from "./WishlistActionState";

const wishlistMessages: UserFacingMessages = [
	[ProductNotFoundError, "This product is no longer available."],
];

export async function saveToWishlist(
	_previousState: WishlistActionState,
	formData: FormData,
): Promise<WishlistActionState> {
	try {
		await retailContainer.wishlistProductSaver.save(
			requiredProductId(formData),
		);
	} catch (error) {
		return { ...actionStateFor(error, wishlistMessages), isSaved: false };
	}

	revalidateWishlistPages();

	return { error: null, isSaved: true };
}
