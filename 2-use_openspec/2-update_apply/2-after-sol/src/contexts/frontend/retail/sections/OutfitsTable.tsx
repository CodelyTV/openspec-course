import Link from "next/link";

import type { OutfitResponse } from "@/contexts/backend/outfits/application/OutfitResponse";
import { Button } from "@/contexts/frontend/design-system/atoms/Button";
import { Table } from "@/contexts/frontend/design-system/molecules/Table";

import { DeleteOutfitForm } from "./DeleteOutfitForm";

import styles from "./OutfitsTable.module.scss";

export function OutfitsTable({
	outfits,
}: {
	outfits: OutfitResponse[];
}): React.JSX.Element {
	return (
		<div className={styles.panel}>
			<div>
				<Button component={Link} href="/admin/outfits/new" size="small">
					Create outfit
				</Button>
			</div>
			{outfits.length === 0 ? (
				<p>No outfits have been created yet.</p>
			) : (
				<Table
					label="Outfits"
					rows={outfits}
					rowKey={(outfit) => outfit.id}
					columns={[
						{ header: "Name", cell: (outfit) => outfit.name },
						{
							header: "Pieces",
							cell: (outfit) => outfit.productIds.length,
						},
						{
							header: "Edit",
							cell: (outfit) => (
								<Link
									href={`/admin/outfits/${outfit.id}/edit`}
									aria-label={`Edit ${outfit.name}`}
								>
									Edit
								</Link>
							),
						},
						{
							header: "Delete",
							cell: (outfit) => (
								<DeleteOutfitForm
									id={outfit.id}
									name={outfit.name}
								/>
							),
						},
					]}
				/>
			)}
		</div>
	);
}
