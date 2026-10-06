import Link from "next/link";

import styles from "./OrderConfirmation.module.scss";

export function OrderConfirmation({
	orderId,
}: {
	orderId: string;
}): React.JSX.Element {
	return (
		<div className={styles.confirmation} role="status">
			<p className={styles.confirmationTitle}>Order confirmed</p>
			<p className={styles.confirmationDetail}>
				Order{" "}
				<Link
					href={`/account/orders/${orderId}`}
					className={styles.orderLink}
				>
					{orderId}
				</Link>{" "}
				has been placed. Your cart is now empty.
			</p>
		</div>
	);
}
