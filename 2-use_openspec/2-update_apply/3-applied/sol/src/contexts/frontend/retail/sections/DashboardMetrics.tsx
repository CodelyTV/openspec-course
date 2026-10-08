import type { OrdersSummaryResponse } from "@/contexts/backend/orders/application/summarize/OrdersSummaryGetter";
import type { LowStockReportResponse } from "@/contexts/backend/products/application/low-stock/LowStockLister";

import { formatMoneyPerCurrency, formatUnits } from "../ui/format";

import { MetricCard } from "./MetricCard";

import styles from "./DashboardMetrics.module.scss";

const tones = ["green", "violet", "yellow", "pink", "neutral"] as const;

export function DashboardMetrics({
	ordersSummary,
	lowStockReport,
}: {
	ordersSummary: OrdersSummaryResponse;
	lowStockReport: LowStockReportResponse;
}): React.JSX.Element {
	const metrics = [
		{
			label: "Revenue",
			value: formatMoneyPerCurrency(ordersSummary.revenuePerCurrency),
			detail: "Confirmed orders",
		},
		{
			label: "Orders",
			value: String(ordersSummary.ordersCount),
			detail: "Total confirmed",
		},
		{
			label: "Average order",
			value: formatMoneyPerCurrency(
				ordersSummary.averageOrderPerCurrency,
			),
			detail: "Per order",
		},
		{
			label: "Low stock",
			value: String(lowStockReport.variants.length),
			detail: `${formatUnits(lowStockReport.threshold)} or fewer`,
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
