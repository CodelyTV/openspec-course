"use server";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { actionStateFor } from "../actionStateFor";

import { requiredProductId } from "./requiredProductId";
import { revalidateWishlistPages } from "./revalidateWishlistPages";
import type { WishlistActionState } from "./WishlistActionState";

export async function removeFromWishlist(
	_previousState: WishlistActionState,
	formData: FormData,
): Promise<WishlistActionState> {
	try {
		await retailContainer.wishlistProductRemover.remove(
			requiredProductId(formData),
		);
	} catch (error) {
		return { ...actionStateFor(error), isSaved: true };
	}

	revalidateWishlistPages();

	return { error: null, isSaved: false };
}
