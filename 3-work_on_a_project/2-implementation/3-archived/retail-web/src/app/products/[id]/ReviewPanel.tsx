import type { ReviewEligibilityResponse } from "@/contexts/frontend/retail/api/responses";

import { ReviewForm } from "./ReviewForm";

import styles from "./ReviewPanel.module.scss";

type ReviewPanelProps = {
	productId: string;
	eligibility: ReviewEligibilityResponse;
};

export function ReviewPanel({
	productId,
	eligibility,
}: ReviewPanelProps): React.JSX.Element | null {
	switch (eligibility.status) {
		case "can-review":
			return <ReviewForm productId={productId} />;
		case "awaiting-moderation":
			return (
				<p role="status" className={styles.notice}>
					Thanks! Your review is awaiting moderation.
				</p>
			);
		case "already-reviewed":
			return (
				<p role="status" className={styles.notice}>
					You already reviewed this product.
				</p>
			);
		case "not-purchased":
			return null;
	}
}
