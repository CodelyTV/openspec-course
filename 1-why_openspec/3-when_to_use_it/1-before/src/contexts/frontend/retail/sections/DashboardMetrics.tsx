import type { DashboardResponse } from "../application/dashboard/DashboardGetter";
import { formatMoneyPerCurrency, formatUnits } from "../ui/format";

import { MetricCard } from "./MetricCard";

import styles from "./DashboardMetrics.module.scss";

const tones = ["green", "violet", "yellow", "pink", "neutral"] as const;

export function DashboardMetrics({
	dashboard,
}: {
	dashboard: DashboardResponse;
}): React.JSX.Element {
	const metrics = [
		{
			label: "Revenue",
			value: formatMoneyPerCurrency(dashboard.revenuePerCurrency),
			detail: "Confirmed orders",
		},
		{
			label: "Orders",
			value: String(dashboard.ordersCount),
			detail: "Total confirmed",
		},
		{
			label: "Average order",
			value: formatMoneyPerCurrency(dashboard.averageOrderPerCurrency),
			detail: "Per order",
		},
		{
			label: "Low stock",
			value: String(dashboard.lowStockCount),
			detail: `${formatUnits(dashboard.lowStockThreshold)} or fewer`,
		},
	];

	return (
		<section className={styles.metrics} aria-label="Key metrics">
			{metrics.map((metric, index) => (
				<MetricCard
					key={metric.label}
					label={metric.label}
					value={metric.value}
					detail={metric.detail}
					tone={tones[index % tones.length]}
				/>
			))}
		</section>
	);
}
