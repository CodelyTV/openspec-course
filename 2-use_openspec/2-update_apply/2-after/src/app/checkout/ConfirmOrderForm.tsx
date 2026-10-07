"use client";

import { useActionState } from "react";

import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../actions/ActionState";
import { confirmOrder } from "../actions/checkout/confirmOrder";

import styles from "./ConfirmOrderForm.module.scss";

export function ConfirmOrderForm({
	isCartEmpty,
}: {
	isCartEmpty: boolean;
}): React.JSX.Element {
	const [state, formAction] = useActionState(
		confirmOrder,
		initialActionState,
	);

	return (
		<form action={formAction} className={styles.form}>
			<SubmitButton disabled={isCartEmpty}>Confirm order</SubmitButton>
			<FormError message={state.error} />
		</form>
	);
}
