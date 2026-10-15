import type { ReviewEligibilityStatus } from "@/contexts/frontend/retail/api/responses";

import { ReviewForm } from "./ReviewForm";

import styles from "./ReviewPanel.module.scss";

type ReviewPanelProps = {
	productId: string;
	eligibility: ReviewEligibilityStatus;
};

export function ReviewPanel({
	productId,
	eligibility,
}: ReviewPanelProps): React.JSX.Element | null {
	switch (eligibility) {
		case "can-review":
			return <ReviewForm productId={productId} />;
		case "pending-review":
			return (
				<p role="status" className={styles.message}>
					Thanks! Your review is awaiting moderation.
				</p>
			);
		case "already-reviewed":
			return (
				<p role="status" className={styles.message}>
					You have already reviewed this product.
				</p>
			);
		case "not-purchased":
			return null;
	}
}
