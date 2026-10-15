import type { Metadata } from "next";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { DashboardMetrics } from "@/contexts/frontend/retail/sections/DashboardMetrics";
import { LowStockPanel } from "@/contexts/frontend/retail/sections/LowStockPanel";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";
import { RecentOrdersPanel } from "@/contexts/frontend/retail/sections/RecentOrdersPanel";

import styles from "./page.module.scss";

export const metadata: Metadata = { title: "Admin" };

const recentOrdersShown = 5;

export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
	const [ordersSummary, recentOrders, lowStockReport] = await Promise.all([
		retailApi.ordersSummaryGetter.get(),
		retailApi.recentOrdersLister.list(recentOrdersShown),
		retailApi.lowStockLister.list(),
	]);

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Overview"
				title="Operations at a glance"
				description="How the store is doing: catalog, stock and orders at a glance."
			/>

			<DashboardMetrics
				ordersSummary={ordersSummary}
				lowStockReport={lowStockReport}
			/>

			<section className={styles.panels}>
				<LowStockPanel variants={lowStockReport.variants} />
				<RecentOrdersPanel orders={recentOrders} />
			</section>
		</div>
	);
}
