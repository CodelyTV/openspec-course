import Link from "next/link";

import { Table } from "@/contexts/frontend/design-system/molecules/Table";
import type { OutfitSummaryResponse } from "@/contexts/frontend/retail/api/responses";

import { formatProductCount } from "../ui/format";

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
			<div className={styles.empty}>
				<p>There are no outfits yet.</p>
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
					cell: (outfit) => formatProductCount(outfit.productCount),
				},
				{
					header: "Stock",
					cell: (outfit) =>
						hasSoldOutPieces(outfit) ? (
							<span className={styles.soldOutWarning}>
								Sold out:{" "}
								{outfit.outOfStockProductNames.join(", ")}
							</span>
						) : (
							<span className={styles.inStock}>
								Every piece in stock
							</span>
						),
				},
			]}
		/>
	);
}
