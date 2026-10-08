import Link from "next/link";

import type { OutfitSummaryResponse } from "@/contexts/backend/products/application/list-outfits/OutfitsLister";
import { Table } from "@/contexts/frontend/design-system/molecules/Table";

import styles from "./OutfitsTable.module.scss";

function hasSoldOutPieces(outfit: OutfitSummaryResponse): boolean {
	return outfit.outOfStockProductNames.length > 0;
}

export function OutfitsTable({
	outfits,
}: {
	outfits: OutfitSummaryResponse[];
}): React.JSX.Element {
	if (outfits.length === 0) {
		return (
			<p className={styles.empty}>
				There are no outfits yet.{" "}
				<Link href="/admin/outfits/new" className={styles.link}>
					Create the first outfit
				</Link>
			</p>
		);
	}

	return (
		<Table
			label="Outfits"
			rows={outfits}
			rowKey={(outfit) => outfit.id}
			isRowHighlighted={hasSoldOutPieces}
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
					cell: (outfit) => outfit.productCount,
				},
				{
					header: "Stock",
					cell: (outfit) =>
						hasSoldOutPieces(outfit) ? (
							<span className={styles.warning}>
								Sold out:{" "}
								{outfit.outOfStockProductNames.join(", ")}
							</span>
						) : null,
				},
			]}
		/>
	);
}
