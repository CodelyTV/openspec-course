import { formatStarRating } from "../ui/format";

import styles from "./ReviewStars.module.scss";

const maxStars = 5;

export function ReviewStars({ rating }: { rating: number }): React.JSX.Element {
	return (
		<span
			role="img"
			aria-label={formatStarRating(rating)}
			className={styles.stars}
		>
			<span aria-hidden="true">{"★".repeat(rating)}</span>
			<span aria-hidden="true" className={styles.empty}>
				{"★".repeat(maxStars - rating)}
			</span>
		</span>
	);
}
