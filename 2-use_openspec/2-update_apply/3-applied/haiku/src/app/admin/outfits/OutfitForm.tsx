"use client";

import { useActionState, useId } from "react";

import type { OutfitResponse } from "@/contexts/backend/products/application/OutfitResponse";
import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../../actions/ActionState";
import { createOutfit } from "../../actions/outfits/createOutfit";
import { updateOutfit } from "../../actions/outfits/updateOutfit";

import styles from "./OutfitForm.module.scss";

const piecesCount = 4;
const requiredPiecesCount = 2;

export type OutfitFormProduct = { id: string; name: string };

export function OutfitForm({
	products,
	outfit,
}: {
	products: OutfitFormProduct[];
	outfit?: OutfitResponse;
}): React.JSX.Element {
	const fieldIdPrefix = useId();
	const [state, formAction] = useActionState(
		outfit ? updateOutfit : createOutfit,
		initialActionState,
	);

	return (
		<form action={formAction} className={styles.form}>
			{outfit ? (
				<input type="hidden" name="outfitId" value={outfit.id} />
			) : null}

			<div className={styles.field}>
				<label htmlFor={`${fieldIdPrefix}-name`}>Name</label>
				<input
					id={`${fieldIdPrefix}-name`}
					name="name"
					className={styles.input}
					defaultValue={outfit?.name ?? ""}
					required
				/>
			</div>

			{Array.from({ length: piecesCount }, (_, index) => {
				const isRequired = index < requiredPiecesCount;
				const selectId = `${fieldIdPrefix}-piece-${index}`;

				return (
					<div key={selectId} className={styles.field}>
						<label htmlFor={selectId}>
							Piece {index + 1}
							{isRequired ? null : (
								<span className={styles.optional}>
									{" "}
									(optional)
								</span>
							)}
						</label>
						<select
							id={selectId}
							name="productIds"
							className={styles.input}
							defaultValue={outfit?.productIds[index] ?? ""}
							required={isRequired}
						>
							<option value="">Choose a product</option>
							{products.map((product) => (
								<option key={product.id} value={product.id}>
									{product.name}
								</option>
							))}
						</select>
					</div>
				);
			})}

			<div className={styles.actions}>
				<SubmitButton>
					{outfit ? "Save outfit" : "Create outfit"}
				</SubmitButton>
				<FormError message={state.error} />
			</div>
		</form>
	);
}
