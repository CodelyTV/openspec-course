"use client";
import { useActionState, useState } from "react";

import { initialActionState } from "@/app/actions/ActionState";
import { createOutfit } from "@/app/actions/outfits/createOutfit";
import { updateOutfit } from "@/app/actions/outfits/updateOutfit";
import type { OutfitResponse } from "@/contexts/backend/outfits/application/OutfitResponse";
import type { ProductResponse } from "@/contexts/backend/products/application/ProductResponse";
import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { Select } from "@/contexts/frontend/design-system/atoms/Select";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";
import { TextField } from "@/contexts/frontend/design-system/atoms/TextField";

import styles from "./OutfitForm.module.scss";

type OutfitFormProps = { products: ProductResponse[]; outfit?: OutfitResponse };
export function OutfitForm({
	products,
	outfit,
}: OutfitFormProps): React.JSX.Element {
	const [name, setName] = useState(outfit?.name ?? "");
	const [pieces, setPieces] = useState(() =>
		[0, 1, 2, 3].map((index) => outfit?.productIds[index] ?? ""),
	);
	const [state, formAction] = useActionState(
		outfit ? updateOutfit : createOutfit,
		initialActionState,
	);
	const options = [
		{ value: "", label: "None" },
		...[...products]
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((product) => ({ value: product.id, label: product.name })),
	];

	return (
		<form
			action={formAction}
			onReset={(event) => event.preventDefault()}
			className={styles.form}
		>
			{outfit ? (
				<input type="hidden" name="id" value={outfit.id} />
			) : null}
			<TextField
				label="Name"
				id="outfit-name"
				name="name"
				value={name}
				onChange={(event) => setName(event.target.value)}
			/>
			<p>
				Choose 2 to 4 distinct products. Filled slots determine the
				piece order.
			</p>
			{pieces.map((piece, index) => (
				<Select
					key={index}
					label={`Piece ${index + 1}`}
					id={`piece-${index}`}
					name={`piece-${index}`}
					value={piece}
					options={options}
					onChange={(event) =>
						setPieces((current) =>
							current.map((value, slot) =>
								slot === index ? event.target.value : value,
							),
						)
					}
				/>
			))}
			<FormError message={state.error} />
			<SubmitButton>
				{outfit ? "Save outfit" : "Create outfit"}
			</SubmitButton>
		</form>
	);
}
