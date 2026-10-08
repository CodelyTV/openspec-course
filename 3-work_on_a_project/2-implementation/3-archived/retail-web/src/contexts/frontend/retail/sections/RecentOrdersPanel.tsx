import Link from "next/link";

import type { OrderResponse } from "@/contexts/frontend/retail/api/responses";

import { formatDayAndMonth, formatMoney, formatUnits } from "../ui/format";

import styles from "./DashboardPanel.module.scss";

export function RecentOrdersPanel({
	orders,
}: {
	orders: OrderResponse[];
}): React.JSX.Element {
	return (
		<article className={styles.panel}>
			<div className={styles.panelHead}>
				<h2 className={styles.panelTitle}>Latest orders</h2>
				<Link href="/admin/orders" className={styles.panelLink}>
					View orders
				</Link>
			</div>
			{orders.length === 0 ? (
				<p className={styles.panelEmpty}>No orders yet.</p>
			) : (
				<ul className={styles.list}>
					{orders.map((order) => (
						<li key={order.id} className={styles.listRow}>
							<span>
								<Link
									href={`/admin/orders/${order.id}`}
									className={styles.listName}
								>
									{order.id}
								</Link>
								<span className={styles.listMeta}>
									{formatDayAndMonth(order.createdAt)} ·{" "}
									{formatUnits(order.items)}
								</span>
							</span>
							<span className={styles.listValue}>
								{formatMoney({
									amount: order.subtotalAmount,
									currency: order.currency,
								})}
							</span>
						</li>
					))}
				</ul>
			)}
		</article>
	);
}
