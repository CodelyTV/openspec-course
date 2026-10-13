"use client";

import { useActionState } from "react";

import { Button } from "@/contexts/frontend/design-system/atoms/Button";
import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { requestRestockAlert } from "../../actions/restock-alerts/requestRestockAlert";
import { initialRestockAlertActionState } from "../../actions/restock-alerts/RestockAlertActionState";

import styles from "./NotifyMeForm.module.scss";

type NotifyMeFormProps = {
	variantId: string;
	hasActiveAlert: boolean;
};

export function NotifyMeForm({
	variantId,
	hasActiveAlert,
}: NotifyMeFormProps): React.JSX.Element {
	const [state, formAction] = useActionState(
		requestRestockAlert,
		initialRestockAlertActionState,
	);

	if (hasActiveAlert || state.isAlertActive) {
		return <Button disabled>Alert active</Button>;
	}

	return (
		<form action={formAction} className={styles.form}>
			<input type="hidden" name="variantId" value={variantId} />
			<SubmitButton>Notify me when it&apos;s back</SubmitButton>
			<FormError message={state.error} />
		</form>
	);
}
