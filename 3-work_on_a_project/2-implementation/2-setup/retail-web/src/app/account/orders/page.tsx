import type { Metadata } from "next";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { CustomerOrdersTable } from "@/contexts/frontend/retail/sections/CustomerOrdersTable";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

export const metadata: Metadata = { title: "My orders" };

export default async function AccountOrdersPage(): Promise<React.JSX.Element> {
	const orders = await retailApi.userOrdersLister.list();

	return (
		<div>
			<PageHeader
				size="compact"
				title="My orders"
				description={`${orders.length} orders placed.`}
			/>
			<CustomerOrdersTable orders={orders} />
		</div>
	);
}
