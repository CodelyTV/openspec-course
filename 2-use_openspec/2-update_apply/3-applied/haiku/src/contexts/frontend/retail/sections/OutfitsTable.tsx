import Link from "next/link";

import type { OutfitSummaryResponse } from "@/contexts/backend/products/application/OutfitResponse";
import { Table } from "@/contexts/frontend/design-system/molecules/Table";

import styles from "./OutfitsTable.module.scss";

export function OutfitsTable({
	outfits,
}: {
	outfits: OutfitSummaryResponse[];
}): React.JSX.Element {
	if (outfits.length === 0) {
		return (
			<div className={styles.empty}>
				<p>No outfits yet.</p>
				<Link href="/admin/outfits/new" className={styles.link}>
					Create the first outfit
				</Link>
			</div>
		);
	}

	return (
		<Table
			label="Outfits"
			rows={outfits}
			rowKey={(outfit) => outfit.id}
			columns={[
				{
					header: "Outfit",
					cell: (outfit) => (
						<Link
							href={`/admin/outfits/${outfit.id}`}
							className={styles.link}
						>
							{outfit.name}
						</Link>
					),
				},
				{
					header: "Products",
					align: "end",
					cell: (outfit) => outfit.productCount,
				},
				{
					header: "Stock",
					cell: (outfit) =>
						outfit.outOfStockProductNames.length > 0 ? (
							<span className={styles.warning}>
								Sold out:{" "}
								{outfit.outOfStockProductNames.join(", ")}
							</span>
						) : (
							"All pieces in stock"
						),
				},
			]}
		/>
	);
}
