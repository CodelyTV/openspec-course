import type { ProductResponse } from "@/contexts/frontend/retail/api/responses";

import styles from "./ProductInfo.module.scss";

export function ProductInfo({
	sizeGuide,
}: {
	sizeGuide: ProductResponse["sizeGuide"];
}): React.JSX.Element {
	return (
		<div className={styles.info}>
			<details className={styles.infoItem}>
				<summary className={styles.infoSummary}>More details</summary>
				<div className={styles.infoBody}>
					<p>
						Main fabric is medium-weight cotton. Designed in A
						Coruña.
					</p>
					<p>
						Machine wash cold, do not tumble dry. Iron inside out.
					</p>
				</div>
			</details>
			<details className={styles.infoItem}>
				<summary className={styles.infoSummary}>Size guide</summary>
				<div className={styles.infoBody}>
					<table className={styles.sizeTable}>
						<thead>
							<tr>
								<th>Size</th>
								<th>Chest (cm)</th>
								<th>Length (cm)</th>
							</tr>
						</thead>
						<tbody>
							{sizeGuide.map((row) => (
								<tr key={row.size}>
									<td>{row.size}</td>
									<td>{row.chest}</td>
									<td>{row.length}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</details>
			<details className={styles.infoItem}>
				<summary className={styles.infoSummary}>
					Shipping and returns
				</summary>
				<div className={styles.infoBody}>
					<p>Home delivery in 2-4 business days.</p>
					<p>Free returns within 30 days if it&apos;s not for you.</p>
				</div>
			</details>
		</div>
	);
}
