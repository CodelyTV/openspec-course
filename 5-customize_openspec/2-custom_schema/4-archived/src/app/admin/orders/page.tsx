import type { Metadata } from "next";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { AdminOrdersTable } from "@/contexts/frontend/retail/sections/AdminOrdersTable";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";
import { formatOrderCount } from "@/contexts/frontend/retail/ui/format";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage(): Promise<React.JSX.Element> {
	const orders = await retailContainer.ordersLister.list();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Orders"
				title="Orders"
				description={`${formatOrderCount(orders.length)}.`}
			/>
			<AdminOrdersTable orders={orders} />
		</div>
	);
}
