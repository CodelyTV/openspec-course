"use client";
import { useActionState } from "react";

import { initialActionState } from "@/app/actions/ActionState";
import { deleteOutfit } from "@/app/actions/outfits/deleteOutfit";
import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

export function DeleteOutfitForm({
	id,
	name,
}: {
	id: string;
	name: string;
}): React.JSX.Element {
	const [state, formAction] = useActionState(
		deleteOutfit,
		initialActionState,
	);

	return (
		<form action={formAction}>
			<input type="hidden" name="id" value={id} />
			<SubmitButton
				mode="danger"
				size="x-small"
				aria-label={`Delete ${name}`}
			>
				Delete
			</SubmitButton>
			<FormError message={state.error} />
		</form>
	);
}
