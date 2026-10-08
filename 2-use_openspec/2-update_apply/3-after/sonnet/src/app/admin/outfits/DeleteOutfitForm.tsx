"use client";

import { useActionState } from "react";

import { Button } from "@/contexts/frontend/design-system/atoms/Button";
import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";

import { initialActionState } from "../../actions/ActionState";
import { deleteOutfit } from "../../actions/outfits/deleteOutfit";

import styles from "./OutfitForm.module.scss";

export function DeleteOutfitForm({
	outfitId,
}: {
	outfitId: string;
}): React.JSX.Element {
	const [state, formAction, isPending] = useActionState(
		deleteOutfit,
		initialActionState,
	);

	return (
		<form action={formAction} className={styles.form}>
			<input type="hidden" name="outfitId" value={outfitId} />
			<Button type="submit" mode="danger" isLoading={isPending}>
				Delete outfit
			</Button>
			<FormError message={state.error} />
		</form>
	);
}
