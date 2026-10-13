import type { ProductReviewsResponse } from "@/contexts/frontend/retail/api/responses";

import { formatLongDate, formatReviewCount } from "../ui/format";

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
