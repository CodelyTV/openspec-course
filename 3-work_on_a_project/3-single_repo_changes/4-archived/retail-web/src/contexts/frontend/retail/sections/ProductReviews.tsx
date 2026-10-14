import type { ProductReviewsResponse } from "@/contexts/frontend/retail/api/responses";

import {
	formatLongDate,
	formatRatingBreakdownRow,
	formatReviewCount,
} from "../ui/format";
import { ratingBreakdown } from "../ui/ratingBreakdown";

import { ReviewStars } from "./ReviewStars";

import styles from "./ProductReviews.module.scss";

export function ProductReviews({
	productReviews,
	children,
}: {
	productReviews: ProductReviewsResponse;
	children?: React.ReactNode;
}): React.JSX.Element {
	const { averageRating, reviewCount, reviews } = productReviews;

	return (
		<section className={styles.section} aria-labelledby="product-reviews">
			<h2 id="product-reviews" className={styles.heading}>
				Reviews
			</h2>

			<p className={styles.summary}>
				{averageRating === null
					? "No reviews yet"
					: `${averageRating} out of 5 · ${formatReviewCount(reviewCount)}`}
			</p>

			{reviews.length > 0 ? (
				<ul className={styles.breakdown} aria-label="Rating breakdown">
					{ratingBreakdown(reviews).map(({ stars, count }) => (
						<li key={stars}>
							<span
								role="img"
								aria-label={formatRatingBreakdownRow(
									stars,
									count,
								)}
								className={styles.breakdownRow}
							>
								<span
									aria-hidden="true"
									className={styles.breakdownStars}
								>
									{stars} ★
								</span>
								<span
									aria-hidden="true"
									className={styles.breakdownBar}
								>
									<span
										className={styles.breakdownBarFill}
										style={{
											width: `${(count / reviews.length) * 100}%`,
										}}
									/>
								</span>
								<span
									aria-hidden="true"
									className={styles.breakdownCount}
								>
									{count}
								</span>
							</span>
						</li>
					))}
				</ul>
			) : null}

			{children}

			{reviews.length > 0 ? (
				<ol className={styles.list}>
					{reviews.map((review) => (
						<li key={review.id}>
							<article
								className={styles.review}
								aria-label={review.title}
							>
								<ReviewStars rating={review.rating} />
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
				</ol>
			) : null}
		</section>
	);
}
