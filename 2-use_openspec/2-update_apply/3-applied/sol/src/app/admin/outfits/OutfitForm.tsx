"use client";

import { useActionState } from "react";

import { initialActionState } from "@/app/actions/ActionState";
import {
	createOutfit,
	deleteOutfit,
	updateOutfit,
} from "@/app/actions/outfits/outfitActions";
import type { OutfitResponse } from "@/contexts/backend/products/application/find-outfit/OutfitFinder";

type ProductOption = { id: string; name: string };

export function OutfitForm({
	outfit,
	products,
}: {
	outfit?: OutfitResponse;
	products: ProductOption[];
}): React.JSX.Element {
	const save = outfit ? updateOutfit.bind(null, outfit.id) : createOutfit;
	const [state, saveAction, pending] = useActionState(
		save,
		initialActionState,
	);
	const [deleteState, deleteAction, deleting] = useActionState(
		deleteOutfit.bind(null, outfit?.id ?? ""),
		initialActionState,
	);

	return (
		<div>
			<form action={saveAction}>
				<label htmlFor="outfit-name">Name</label>
				<input
					id="outfit-name"
					name="name"
					defaultValue={outfit?.name ?? ""}
					required
				/>
				{Array.from({ length: 4 }, (_, index) => (
					<div key={index}>
						<label htmlFor={`outfit-product-${index}`}>
							Product {index + 1}
						</label>
						<select
							id={`outfit-product-${index}`}
							name="productIds"
							defaultValue={outfit?.productIds[index] ?? ""}
							required={index < 2}
						>
							<option value="">
								{index < 2 ? "Choose a product" : "None"}
							</option>
							{products.map((product) => (
								<option key={product.id} value={product.id}>
									{product.name}
								</option>
							))}
						</select>
					</div>
				))}
				{state.error ? <p role="alert">{state.error}</p> : null}
				<button type="submit" disabled={pending}>
					{pending ? "Saving..." : "Save outfit"}
				</button>
			</form>
			{outfit ? (
				<form action={deleteAction}>
					{deleteState.error ? (
						<p role="alert">{deleteState.error}</p>
					) : null}
					<button type="submit" disabled={deleting}>
						{deleting ? "Deleting..." : "Delete outfit"}
					</button>
				</form>
			) : null}
		</div>
	);
}
