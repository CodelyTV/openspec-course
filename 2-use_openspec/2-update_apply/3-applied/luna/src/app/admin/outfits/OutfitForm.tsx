"use client";
import { useActionState } from "react";

import type { ActionState } from "@/app/actions/ActionState";
import { initialActionState } from "@/app/actions/ActionState";
import type { OutfitResponse } from "@/contexts/backend/products/application/find-outfit/OutfitFinder";
import type { ProductResponse } from "@/contexts/backend/products/application/ProductResponse";

export function OutfitForm({
	products,
	outfit,
	action,
	deleteAction,
}: {
	products: ProductResponse[];
	outfit?: OutfitResponse;
	action: (state: ActionState, data: FormData) => Promise<ActionState>;
	deleteAction?: (state: ActionState, data: FormData) => Promise<ActionState>;
}): React.JSX.Element {
	const [state, formAction, pending] = useActionState(
		action,
		initialActionState,
	);

	return (
		<form action={formAction}>
			{outfit ? (
				<input type="hidden" name="id" value={outfit.id} />
			) : null}
			<label>
				Name{" "}
				<input name="name" required defaultValue={outfit?.name ?? ""} />
			</label>
			{[0, 1, 2, 3].map((index) => (
				<label key={index}>
					Product {index + 1}
					{index < 2 ? " *" : ""}
					<select
						name="productIds"
						required={index < 2}
						defaultValue={outfit?.productIds[index] ?? ""}
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
			{state.error ? <p role="alert">{state.error}</p> : null}
			<button type="submit" disabled={pending}>
				{pending ? "Saving…" : "Save outfit"}
			</button>
			{outfit && deleteAction ? (
				<DeleteForm id={outfit.id} action={deleteAction} />
			) : null}
		</form>
	);
}

function DeleteForm({
	id,
	action,
}: {
	id: string;
	action: NonNullable<Parameters<typeof OutfitForm>[0]["deleteAction"]>;
}): React.JSX.Element {
	const [state, formAction, pending] = useActionState(
		action,
		initialActionState,
	);

	return (
		<form action={formAction}>
			<input type="hidden" name="id" value={id} />
			{state.error ? <p role="alert">{state.error}</p> : null}
			<button type="submit" disabled={pending}>
				Delete outfit
			</button>
		</form>
	);
}
