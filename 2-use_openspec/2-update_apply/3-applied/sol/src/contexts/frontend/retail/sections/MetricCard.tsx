import { useId } from "react";

import styles from "./MetricCard.module.scss";

type MetricCardProps = {
	label: string;
	value: string;
	detail: string;
	tone?: "green" | "violet" | "yellow" | "pink" | "neutral";
};

export function MetricCard({
	label,
	value,
	detail,
	tone = "green",
}: MetricCardProps): React.JSX.Element {
	const labelId = useId();

	return (
		<article
			className={`${styles.card} ${styles[tone]}`}
			aria-labelledby={labelId}
		>
			<p className={styles.label} id={labelId}>
				{label}
			</p>
			<p className={styles.value}>{value}</p>
			<p className={styles.detail}>{detail}</p>
		</article>
	);
}
