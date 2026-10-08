"use client";

import { useActionState } from "react";

import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../actions/ActionState";
import { removeCartLine } from "../actions/checkout/removeCartLine";

type RemoveCartLineFormProps = {
	variantId: string;
	lineLabel: string;
};

export function RemoveCartLineForm({
	variantId,
	lineLabel,
}: RemoveCartLineFormProps): React.JSX.Element {
	const [state, formAction] = useActionState(
		removeCartLine,
		initialActionState,
	);

	return (
		<form action={formAction}>
			<input type="hidden" name="variantId" value={variantId} />
			<SubmitButton
				mode="danger"
				size="x-small"
				aria-label={`Remove ${lineLabel}`}
			>
				Remove
			</SubmitButton>
			<FormError message={state.error} />
		</form>
	);
}
