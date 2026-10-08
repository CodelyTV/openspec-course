import type { PendingReviewResponse } from "@/contexts/frontend/retail/api/responses";
import { StarRating } from "@/contexts/frontend/retail/sections/StarRating";
import { formatLongDate } from "@/contexts/frontend/retail/ui/format";

import { ModerateReviewForm } from "./ModerateReviewForm";

import styles from "./PendingReviewsList.module.scss";

export function PendingReviewsList({
	reviews,
}: {
	reviews: PendingReviewResponse[];
}): React.JSX.Element {
	if (reviews.length === 0) {
		return <p className={styles.empty}>No reviews to moderate</p>;
	}

	return (
		<ul className={styles.list} aria-label="Pending reviews">
			{reviews.map((review) => (
				<li key={review.id} className={styles.review}>
					<article aria-label={review.title}>
						<p className="eyebrow">{review.productName}</p>
						<StarRating rating={review.rating} />
						<h2 className={styles.title}>{review.title}</h2>
						<p className={styles.body}>{review.body}</p>
						<p className={styles.meta}>
							{review.authorName} ·{" "}
							<time dateTime={review.createdAt}>
								{formatLongDate(review.createdAt)}
							</time>
						</p>
						<ModerateReviewForm reviewId={review.id} />
					</article>
				</li>
			))}
		</ul>
	);
}
