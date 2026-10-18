"use client";

import { useActionState } from "react";

import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { removeFromWishlist } from "../../actions/wishlist/removeFromWishlist";
import { saveToWishlist } from "../../actions/wishlist/saveToWishlist";
import type { WishlistActionState } from "../../actions/wishlist/WishlistActionState";

import styles from "./WishlistToggleForm.module.scss";

type WishlistToggleFormProps = {
	productId: string;
	isSavedToWishlist: boolean;
};

async function toggleWishlist(
	previousState: WishlistActionState,
	formData: FormData,
): Promise<WishlistActionState> {
	return previousState.isSaved
		? removeFromWishlist(previousState, formData)
		: saveToWishlist(previousState, formData);
}

export function WishlistToggleForm({
	productId,
	isSavedToWishlist,
}: WishlistToggleFormProps): React.JSX.Element {
	const [state, formAction] = useActionState(toggleWishlist, {
		error: null,
		isSaved: isSavedToWishlist,
	});

	return (
		<form action={formAction} className={styles.form}>
			<input type="hidden" name="productId" value={productId} />
			<SubmitButton mode="secondary">
				{state.isSaved ? "Remove from wishlist" : "Save to wishlist"}
			</SubmitButton>
			<FormError message={state.error} />
		</form>
	);
}
