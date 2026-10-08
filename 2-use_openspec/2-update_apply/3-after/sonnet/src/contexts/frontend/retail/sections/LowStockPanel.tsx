import Link from "next/link";

import type { LowStockResponse } from "@/contexts/backend/products/application/low-stock/LowStockLister";

import { formatOutfitCount, formatUnits, variantLabel } from "../ui/format";

import styles from "./DashboardPanel.module.scss";

const variantsShown = 6;

export function LowStockPanel({
	variants,
}: {
	variants: LowStockResponse[];
}): React.JSX.Element {
	const shownVariants = variants.slice(0, variantsShown);

	return (
		<article className={styles.panel}>
			<div className={styles.panelHead}>
				<h2 className={styles.panelTitle}>Low stock</h2>
				<Link href="/admin/inventory" className={styles.panelLink}>
					View inventory
				</Link>
			</div>
			{variants.length === 0 ? (
				<p className={styles.panelEmpty}>No stock alerts.</p>
			) : (
				<ul className={styles.list}>
					{shownVariants.map((variant) => {
						const label = variantLabel(variant.color, variant.size);

						return (
							<li
								key={`${variant.productName}-${label}`}
								className={styles.listRow}
							>
								<span>
									<span className={styles.listName}>
										{variant.productName}
									</span>
									<span className={styles.listMeta}>
										{label}
									</span>
								</span>
								<span className={styles.tags}>
									{variant.outfitCount > 0 ? (
										<span className={styles.outfitTag}>
											{formatOutfitCount(
												variant.outfitCount,
											)}
										</span>
									) : null}
									<span className={styles.stockTag}>
										{formatUnits(variant.stock)}
									</span>
								</span>
							</li>
						);
					})}
				</ul>
			)}
		</article>
	);
}
