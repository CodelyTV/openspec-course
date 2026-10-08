import Link from "next/link";

import type { OutfitSummaryResponse } from "@/contexts/backend/products/application/list-outfits/OutfitsLister";
import { Table } from "@/contexts/frontend/design-system/molecules/Table";

export function OutfitsTable({
	outfits,
}: {
	outfits: OutfitSummaryResponse[];
}): React.JSX.Element {
	if (outfits.length === 0) {
		return (
			<p>
				No outfits yet.{" "}
				<Link href="/admin/outfits/new">Create the first outfit</Link>.
			</p>
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
						<Link href={`/admin/outfits/${outfit.id}`}>
							{outfit.name}
						</Link>
					),
				},
				{
					header: "Products",
					cell: (outfit) =>
						`${outfit.productCount} ${outfit.productCount === 1 ? "product" : "products"}`,
				},
				{
					header: "Stock",
					cell: (outfit) =>
						outfit.outOfStockProductNames.length ? (
							<span role="status">
								Sold out:{" "}
								{outfit.outOfStockProductNames.join(", ")}
							</span>
						) : null,
				},
			]}
		/>
	);
}
