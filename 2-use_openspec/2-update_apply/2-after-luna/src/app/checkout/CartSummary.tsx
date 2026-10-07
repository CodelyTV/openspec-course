import { useId } from "react";

import type { CheckoutResponse } from "@/contexts/backend/checkout/application/view/CheckoutViewGetter";
import { Badge } from "@/contexts/frontend/design-system/atoms/Badge";
import {
	formatMoney,
	formatStatus,
	variantLabel,
} from "@/contexts/frontend/retail/ui/format";

import { RemoveCartLineForm } from "./RemoveCartLineForm";

import styles from "./CartSummary.module.scss";

export function CartSummary({
	checkout,
}: {
	checkout: CheckoutResponse;
}): React.JSX.Element {
	const titleId = useId();

	return (
		<article className={styles.card} aria-labelledby={titleId}>
			<div className={styles.cardHead}>
				<div>
					<p className="eyebrow">Order</p>
					<h2 className={styles.cardTitle} id={titleId}>
						Cart summary
					</h2>
				</div>
				<Badge color="alt-1">{formatStatus(checkout.status)}</Badge>
			</div>
			<div className={styles.lines}>
				{checkout.lines.length === 0 ? (
					<div className={styles.empty}>
						<p className={styles.emptyTitle}>Your cart is empty</p>
						<p className={styles.emptyDetail}>
							Add a product from the catalog before checking out.
						</p>
					</div>
				) : (
					checkout.lines.map((line) => {
						const lineVariant = variantLabel(line.color, line.size);

						return (
							<div key={line.variantId} className={styles.line}>
								<div>
									<p className={styles.lineName}>
										{line.productName}
									</p>
									<p className={styles.lineMeta}>
										{lineVariant} · Qty {line.quantity}
									</p>
								</div>
								<div className={styles.lineRight}>
									<p className={styles.lineTotal}>
										{formatMoney(line.lineTotal)}
									</p>
									<RemoveCartLineForm
										variantId={line.variantId}
										lineLabel={`${line.productName} ${lineVariant}`}
									/>
								</div>
							</div>
						);
					})
				)}
			</div>
		</article>
	);
}
