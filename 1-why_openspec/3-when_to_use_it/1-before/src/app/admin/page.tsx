import type { Metadata } from "next";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { DashboardMetrics } from "@/contexts/frontend/retail/sections/DashboardMetrics";
import { LowStockPanel } from "@/contexts/frontend/retail/sections/LowStockPanel";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";
import { RecentOrdersPanel } from "@/contexts/frontend/retail/sections/RecentOrdersPanel";

import styles from "./page.module.scss";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
	const dashboard = await retailContainer.dashboardGetter.get();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Overview"
				title="Operations at a glance"
				description="How the store is doing: catalog, stock and orders at a glance."
			/>

			<DashboardMetrics dashboard={dashboard} />

			<section className={styles.panels}>
				<LowStockPanel variants={dashboard.lowStock} />
				<RecentOrdersPanel orders={dashboard.recentOrders} />
			</section>
		</div>
	);
}
