import type { ProductReviewsResponse } from "@/contexts/frontend/retail/api/responses";
import {
	formatLongDate,
	formatRating,
	formatReviewCount,
} from "@/contexts/frontend/retail/ui/format";

import { StarRating } from "./StarRating";

import styles from "./ProductReviews.module.scss";

type ProductReviewsProps = {
	productReviews: ProductReviewsResponse;
	children?: React.ReactNode;
};

export function ProductReviews({
	productReviews,
	children,
}: ProductReviewsProps): React.JSX.Element {
	const { averageRating, reviewCount, reviews } = productReviews;

	return (
		<section className={styles.section} aria-labelledby="reviews-heading">
			<p className="eyebrow">Customer feedback</p>
			<h2 id="reviews-heading" className={styles.heading}>
				Reviews
			</h2>

			{averageRating === null ? (
				<p className={styles.empty}>No reviews yet</p>
			) : (
				<p className={styles.summary}>
					<StarRating rating={averageRating} />
					<strong>{formatRating(averageRating)}</strong>
					<span className={styles.count}>
						{formatReviewCount(reviewCount)}
					</span>
				</p>
			)}

			{children}

			{reviews.length > 0 ? (
				<ul className={styles.list} aria-label="Approved reviews">
					{reviews.map((review) => (
						<li key={review.id} className={styles.review}>
							<article aria-label={review.title}>
								<StarRating rating={review.rating} />
								<h3 className={styles.title}>{review.title}</h3>
								<p className={styles.body}>{review.body}</p>
								<p className={styles.meta}>
									{review.authorName} ·{" "}
									<time dateTime={review.createdAt}>
										{formatLongDate(review.createdAt)}
									</time>
								</p>
							</article>
						</li>
					))}
				</ul>
			) : null}
		</section>
	);
}
