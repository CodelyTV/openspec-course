"use client";

import { useActionState, useState } from "react";

import type { OutfitResponse } from "@/contexts/backend/products/application/find-outfit/OutfitFinder";
import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../../actions/ActionState";
import { createOutfit } from "../../actions/outfits/createOutfit";
import { updateOutfit } from "../../actions/outfits/updateOutfit";

import styles from "./OutfitForm.module.scss";

export type OutfitProductOption = { id: string; name: string };

type OutfitFormProps = {
	products: OutfitProductOption[];
	outfit?: OutfitResponse;
};

const pieceSlots = 4;
const requiredPieces = 2;
const noProduct = "";

function keepWhatTheAdminFilledInAfterAFailedSave(
	event: React.FormEvent<HTMLFormElement>,
): void {
	event.preventDefault();
}

function initialPiecesOf(outfit: OutfitResponse | undefined): string[] {
	return Array.from(
		{ length: pieceSlots },
		(_, slot) => outfit?.productIds[slot] ?? noProduct,
	);
}

export function OutfitForm({
	products,
	outfit,
}: OutfitFormProps): React.JSX.Element {
	const isEditing = outfit !== undefined;
	const [state, formAction] = useActionState(
		isEditing ? updateOutfit : createOutfit,
		initialActionState,
	);
	const [name, setName] = useState(outfit?.name ?? "");
	const [pieces, setPieces] = useState(() => initialPiecesOf(outfit));

	function choosePiece(slot: number, productId: string): void {
		setPieces((current) =>
			current.map((piece, index) => (index === slot ? productId : piece)),
		);
	}

	return (
		<form
			action={formAction}
			onReset={keepWhatTheAdminFilledInAfterAFailedSave}
			className={styles.form}
		>
			{isEditing ? (
				<input type="hidden" name="id" value={outfit.id} />
			) : null}

			<label className={styles.field}>
				Name
				<input
					className={styles.input}
					name="name"
					value={name}
					onChange={(event) => setName(event.target.value)}
					required
				/>
			</label>

			<fieldset className={styles.pieces}>
				<legend className={styles.legend}>
					Pieces{" "}
					<span className={styles.hint}>
						(between 2 and 4, in the order they are shown)
					</span>
				</legend>
				{pieces.map((piece, slot) => {
					const isRequired = slot < requiredPieces;

					return (
						<label key={slot} className={styles.field}>
							{`Piece ${slot + 1}${isRequired ? "" : " (optional)"}`}
							<select
								className={styles.input}
								name="productIds"
								value={piece}
								onChange={(event) =>
									choosePiece(slot, event.target.value)
								}
								required={isRequired}
							>
								<option value={noProduct}>
									Choose a product
								</option>
								{products.map((product) => (
									<option key={product.id} value={product.id}>
										{product.name}
									</option>
								))}
							</select>
						</label>
					);
				})}
			</fieldset>

			<FormError message={state.error} />

			<div>
				<SubmitButton>
					{isEditing ? "Save outfit" : "Create outfit"}
				</SubmitButton>
			</div>
		</form>
	);
}
