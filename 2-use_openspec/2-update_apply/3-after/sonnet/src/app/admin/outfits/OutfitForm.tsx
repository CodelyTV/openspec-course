"use client";

import { useActionState } from "react";

import type { OutfitResponse } from "@/contexts/backend/products/application/find-outfit/OutfitFinder";
import {
	maxOutfitProducts,
	minOutfitProducts,
} from "@/contexts/backend/products/domain/Outfit";
import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../../actions/ActionState";
import { createOutfit } from "../../actions/outfits/createOutfit";
import { updateOutfit } from "../../actions/outfits/updateOutfit";

import styles from "./OutfitForm.module.scss";

export type ProductOption = { id: string; name: string };

type OutfitFormProps = {
	products: ProductOption[];
	outfit?: OutfitResponse;
};

const pieceNumbers = Array.from(
	{ length: maxOutfitProducts },
	(_, index) => index + 1,
);

export function OutfitForm({
	products,
	outfit,
}: OutfitFormProps): React.JSX.Element {
	const [state, formAction] = useActionState(
		outfit ? updateOutfit : createOutfit,
		initialActionState,
	);

	return (
		<form action={formAction} className={styles.form}>
			{outfit ? (
				<input type="hidden" name="outfitId" value={outfit.id} />
			) : null}

			<label className={styles.field}>
				<span className={styles.label}>Name</span>
				<input
					type="text"
					name="name"
					required
					defaultValue={outfit?.name ?? ""}
					className={styles.control}
				/>
			</label>

			{pieceNumbers.map((pieceNumber) => (
				<label key={pieceNumber} className={styles.field}>
					<span className={styles.label}>Product {pieceNumber}</span>
					<select
						name="productIds"
						required={pieceNumber <= minOutfitProducts}
						defaultValue={outfit?.productIds[pieceNumber - 1] ?? ""}
						className={styles.control}
					>
						<option value="">Select a product</option>
						{products.map((product) => (
							<option key={product.id} value={product.id}>
								{product.name}
							</option>
						))}
					</select>
				</label>
			))}

			<SubmitButton>
				{outfit ? "Save outfit" : "Create outfit"}
			</SubmitButton>
			<FormError message={state.error} />
		</form>
	);
}
