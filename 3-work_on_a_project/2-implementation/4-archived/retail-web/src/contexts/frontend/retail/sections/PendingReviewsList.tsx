import Link from "next/link";

import type { PendingReviewResponse } from "@/contexts/frontend/retail/api/responses";

import { formatLongDate } from "../ui/format";

import { ReviewStars } from "./ReviewStars";

import styles from "./PendingReviewsList.module.scss";

type PendingReviewsListProps = {
	reviews: PendingReviewResponse[];
	actionsFor?: (review: PendingReviewResponse) => React.ReactNode;
};

export function PendingReviewsList({
	reviews,
	actionsFor,
}: PendingReviewsListProps): React.JSX.Element {
	if (reviews.length === 0) {
		return <p className={styles.empty}>No reviews awaiting moderation.</p>;
	}

	return (
		<ol className={styles.list}>
			{reviews.map((review) => (
				<li key={review.id}>
					<article className={styles.card} aria-label={review.title}>
						<p className={styles.meta}>
							<Link
								href={`/products/${encodeURIComponent(review.productId)}`}
								className={styles.product}
							>
								{review.productName}
							</Link>
							{" · "}
							{review.authorName}
							{" · "}
							<time dateTime={review.createdAt}>
								{formatLongDate(review.createdAt)}
							</time>
						</p>
						<ReviewStars rating={review.rating} />
						<h2 className={styles.title}>{review.title}</h2>
						<p className={styles.body}>{review.body}</p>
						{actionsFor?.(review)}
					</article>
				</li>
			))}
		</ol>
	);
}
