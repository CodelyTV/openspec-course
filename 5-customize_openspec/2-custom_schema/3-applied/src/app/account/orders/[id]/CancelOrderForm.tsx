"use client";

import { useActionState } from "react";

import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../../../actions/ActionState";
import { cancelOrder } from "../../../actions/orders/cancelOrder";

export function CancelOrderForm({
	orderId,
}: {
	orderId: string;
}): React.JSX.Element {
	const [state, formAction] = useActionState(cancelOrder, initialActionState);

	return (
		<form action={formAction}>
			<input type="hidden" name="orderId" value={orderId} />
			<SubmitButton mode="danger" size="small">
				Cancel order
			</SubmitButton>
			<FormError message={state.error} />
		</form>
	);
}
