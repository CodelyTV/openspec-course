"use client";

import { useActionState } from "react";

import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../../actions/ActionState";
import { deleteOutfit } from "../../actions/outfits/deleteOutfit";

export function DeleteOutfitForm({
	outfitId,
}: {
	outfitId: string;
}): React.JSX.Element {
	const [state, formAction] = useActionState(
		deleteOutfit,
		initialActionState,
	);

	return (
		<form action={formAction}>
			<input type="hidden" name="id" value={outfitId} />
			<SubmitButton mode="danger" size="small">
				Delete outfit
			</SubmitButton>
			<FormError message={state.error} />
		</form>
	);
}
