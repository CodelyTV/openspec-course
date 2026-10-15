"use client";

import { useActionState } from "react";

import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

import { initialActionState } from "../../actions/ActionState";
import { approveReview } from "../../actions/reviews/approveReview";
import { rejectReview } from "../../actions/reviews/rejectReview";

import styles from "./ModerateReviewForm.module.scss";

export function ModerateReviewForm({
	reviewId,
}: {
	reviewId: string;
}): React.JSX.Element {
	const [approvalState, approve] = useActionState(
		approveReview,
		initialActionState,
	);
	const [rejectionState, reject] = useActionState(
		rejectReview,
		initialActionState,
	);

	return (
		<form className={styles.form}>
			<input type="hidden" name="reviewId" value={reviewId} />
			<div className={styles.buttons}>
				<SubmitButton size="small" formAction={approve}>
					Approve
				</SubmitButton>
				<SubmitButton size="small" mode="danger" formAction={reject}>
					Reject
				</SubmitButton>
			</div>
			<FormError message={approvalState.error ?? rejectionState.error} />
		</form>
	);
}
