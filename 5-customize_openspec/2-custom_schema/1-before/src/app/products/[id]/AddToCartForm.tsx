"use client";

import { useActionState } from "react";

import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../../actions/ActionState";
import { addSelectedVariantToCart } from "../../actions/checkout/addSelectedVariantToCart";

import styles from "./AddToCartForm.module.scss";

type AddToCartFormProps = {
	variantId: string;
};

export function AddToCartForm({
	variantId,
}: AddToCartFormProps): React.JSX.Element {
	const [state, formAction] = useActionState(
		addSelectedVariantToCart,
		initialActionState,
	);

	return (
		<form action={formAction} className={styles.form}>
			<input type="hidden" name="variantId" value={variantId} />
			<SubmitButton>Add to cart</SubmitButton>
			<FormError message={state.error} />
		</form>
	);
}
