"use client";

import { useActionState } from "react";

import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../../actions/ActionState";
import { submitReview } from "../../actions/reviews/submitReview";

import styles from "./ReviewForm.module.scss";

const ratings = [1, 2, 3, 4, 5];
const maxTitleLength = 100;
const maxBodyLength = 2000;

function keepWhatTheCustomerWroteAfterAFailedSubmit(
	event: React.FormEvent<HTMLFormElement>,
): void {
	event.preventDefault();
}

export function ReviewForm({
	productId,
}: {
	productId: string;
}): React.JSX.Element {
	const [state, formAction] = useActionState(
		submitReview,
		initialActionState,
	);

	return (
		<form
			action={formAction}
			onReset={keepWhatTheCustomerWroteAfterAFailedSubmit}
			className={styles.form}
			aria-label="Write a review"
		>
			<input type="hidden" name="productId" value={productId} />

			<fieldset className={styles.rating}>
				<legend className={styles.label}>Rating</legend>
				{ratings.map((rating) => (
					<label key={rating} className={styles.star}>
						<input
							className={styles.starInput}
							type="radio"
							name="rating"
							value={rating}
							required
						/>
						<span aria-hidden="true">★</span>
						<span className={styles.starName}>
							{rating === 1 ? "1 star" : `${rating} stars`}
						</span>
					</label>
				))}
			</fieldset>

			<label className={styles.field}>
				<span className={styles.label}>Title</span>
				<input
					className={styles.input}
					name="title"
					maxLength={maxTitleLength}
					required
				/>
			</label>

			<label className={styles.field}>
				<span className={styles.label}>Review</span>
				<textarea
					className={styles.input}
					name="body"
					rows={5}
					maxLength={maxBodyLength}
					required
				/>
			</label>

			<FormError message={state.error} />

			<div>
				<SubmitButton size="small">Submit review</SubmitButton>
			</div>
		</form>
	);
}
