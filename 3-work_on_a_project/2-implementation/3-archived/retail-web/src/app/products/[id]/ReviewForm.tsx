"use client";

import { useActionState, useState } from "react";

import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../../actions/ActionState";
import { submitReview } from "../../actions/reviews/submitReview";

import styles from "./ReviewForm.module.scss";

const starOptions = [1, 2, 3, 4, 5];
const maxTitleLength = 100;
const maxBodyLength = 2000;
const noRating = "";

function keepWhatTheCustomerWroteAfterAFailedSubmit(
	event: React.FormEvent<HTMLFormElement>,
): void {
	event.preventDefault();
}

function starsLabel(stars: number): string {
	return `${stars} ${stars === 1 ? "star" : "stars"}`;
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
	const [rating, setRating] = useState(noRating);
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");

	return (
		<form
			action={formAction}
			onReset={keepWhatTheCustomerWroteAfterAFailedSubmit}
			className={styles.form}
			aria-label="Write a review"
		>
			<input type="hidden" name="productId" value={productId} />

			<fieldset className={styles.rating}>
				<legend className={styles.legend}>Rating</legend>
				{starOptions.map((stars) => (
					<label key={stars} className={styles.star}>
						<input
							type="radio"
							name="rating"
							value={stars}
							checked={rating === String(stars)}
							onChange={(event) => setRating(event.target.value)}
							required
						/>
						{starsLabel(stars)}
					</label>
				))}
			</fieldset>

			<label className={styles.field}>
				Title
				<input
					className={styles.input}
					name="title"
					value={title}
					maxLength={maxTitleLength}
					onChange={(event) => setTitle(event.target.value)}
				/>
			</label>

			<label className={styles.field}>
				Review
				<textarea
					className={styles.input}
					name="body"
					value={body}
					rows={4}
					maxLength={maxBodyLength}
					onChange={(event) => setBody(event.target.value)}
				/>
			</label>

			<FormError message={state.error} />

			<div>
				<SubmitButton>Submit review</SubmitButton>
			</div>
		</form>
	);
}
