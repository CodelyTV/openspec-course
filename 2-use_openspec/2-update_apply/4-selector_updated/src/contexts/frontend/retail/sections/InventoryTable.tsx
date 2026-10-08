import type { InventoryResponse } from "@/contexts/backend/products/application/inventory/InventoryLister";
import { Badge } from "@/contexts/frontend/design-system/atoms/Badge";
import { Table } from "@/contexts/frontend/design-system/molecules/Table";

import { variantLabel } from "../ui/format";

import styles from "./InventoryTable.module.scss";

export function InventoryTable({
	inventory,
}: {
	inventory: InventoryResponse[];
}): React.JSX.Element {
	return (
		<Table
			label="Inventory"
			rows={inventory}
			rowKey={(row) =>
				`${row.productName}-${variantLabel(row.color, row.size)}`
			}
			isRowHighlighted={(row) => row.low}
			columns={[
				{
					header: "Product",
					cell: (row) => (
						<span className={styles.product}>
							{row.productName}
							{row.inOutfit ? (
								<Badge color="alt-2" size="xs">
									In outfit
								</Badge>
							) : null}
						</span>
					),
				},
				{ header: "Collection", cell: (row) => row.collection },
				{
					header: "Variant",
					cell: (row) => variantLabel(row.color, row.size),
				},
				{
					header: "Stock",
					align: "end",
					cell: (row) => (
						<span
							className={row.low ? styles.lowTag : styles.stock}
						>
							{row.stock}
						</span>
					),
				},
			]}
		/>
	);
}
