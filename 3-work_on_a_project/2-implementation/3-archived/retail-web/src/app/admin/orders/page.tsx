import type { Metadata } from "next";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { AdminOrdersTable } from "@/contexts/frontend/retail/sections/AdminOrdersTable";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage(): Promise<React.JSX.Element> {
	const orders = await retailApi.ordersLister.list();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Orders"
				title="Orders"
				description={`${orders.length} confirmed orders.`}
			/>
			<AdminOrdersTable orders={orders} />
		</div>
	);
}
