import { Badge } from "@/contexts/frontend/design-system/atoms/Badge";
import type { ProductResponse } from "@/contexts/frontend/retail/api/responses";

import { formatUnits } from "../ui/format";

import styles from "./CatalogSummary.module.scss";

export function CatalogSummary({
	products,
}: {
	products: ProductResponse[];
}): React.JSX.Element {
	const unitsReadyToShip = products.reduce(
		(total, product) => total + product.totalOnlineStock,
		0,
	);

	return (
		<div className={styles.summary}>
			<Badge color="alt-1">Active collection</Badge>
			<p className={styles.summaryCount}>{products.length} products</p>
			<p className={styles.summaryDetail}>
				{formatUnits(unitsReadyToShip)} ready to ship.
			</p>
		</div>
	);
}
