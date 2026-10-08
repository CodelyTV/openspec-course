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
	const [approvalState, approveAction] = useActionState(
		approveReview,
		initialActionState,
	);
	const [rejectionState, rejectAction] = useActionState(
		rejectReview,
		initialActionState,
	);

	return (
		<form className={styles.form}>
			<input type="hidden" name="id" value={reviewId} />
			<div className={styles.actions}>
				<SubmitButton size="small" formAction={approveAction}>
					Approve
				</SubmitButton>
				<SubmitButton
					size="small"
					mode="danger"
					formAction={rejectAction}
				>
					Reject
				</SubmitButton>
			</div>
			<FormError message={approvalState.error ?? rejectionState.error} />
		</form>
	);
}
