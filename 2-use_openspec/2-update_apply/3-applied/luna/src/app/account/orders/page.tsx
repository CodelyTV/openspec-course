import type { Metadata } from "next";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { CustomerOrdersTable } from "@/contexts/frontend/retail/sections/CustomerOrdersTable";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

export const metadata: Metadata = { title: "My orders" };

export default async function AccountOrdersPage(): Promise<React.JSX.Element> {
	const orders = await retailContainer.userOrdersLister.list();

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
