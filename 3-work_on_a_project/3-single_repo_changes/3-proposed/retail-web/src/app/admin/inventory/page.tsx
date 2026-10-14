import type { Metadata } from "next";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { InventoryTable } from "@/contexts/frontend/retail/sections/InventoryTable";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage(): Promise<React.JSX.Element> {
	const inventory = await retailApi.inventoryLister.list();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Inventory"
				title="Inventory"
				description={`${inventory.variants.length} variants · ${inventory.lowStockCount} with low stock.`}
			/>
			<InventoryTable inventory={inventory.variants} />
		</div>
	);
}
