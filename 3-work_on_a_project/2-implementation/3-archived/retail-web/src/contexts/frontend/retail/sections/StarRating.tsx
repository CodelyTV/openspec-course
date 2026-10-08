import { formatRating } from "@/contexts/frontend/retail/ui/format";

import styles from "./StarRating.module.scss";

const maxStars = 5;

export function StarRating({ rating }: { rating: number }): React.JSX.Element {
	const filledStars = Math.round(rating);

	return (
		<span
			role="img"
			aria-label={`${formatRating(rating)} stars`}
			className={styles.stars}
		>
			<span aria-hidden="true">
				{"★".repeat(filledStars)}
				<span className={styles.empty}>
					{"★".repeat(maxStars - filledStars)}
				</span>
			</span>
		</span>
	);
}
