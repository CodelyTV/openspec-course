import Link from "next/link";

import { Table } from "@/contexts/frontend/design-system/molecules/Table";
import type { OrderResponse } from "@/contexts/frontend/retail/api/responses";

import { formatMoney, formatShortDate, formatStatus } from "../ui/format";

import styles from "./orders.module.scss";

export function AdminOrdersTable({
	orders,
}: {
	orders: OrderResponse[];
}): React.JSX.Element {
	if (orders.length === 0) {
		return <p>No orders have been placed yet.</p>;
	}

	return (
		<Table
			label="Orders"
			rows={orders}
			rowKey={(order) => order.id}
			columns={[
				{
					header: "Order",
					cell: (order) => (
						<Link
							href={`/admin/orders/${order.id}`}
							className={styles.link}
						>
							{order.id}
						</Link>
					),
				},
				{ header: "Customer", cell: (order) => order.customerName },
				{
					header: "Date",
					cell: (order) => formatShortDate(order.createdAt),
				},
				{ header: "Units", cell: (order) => order.items },
				{
					header: "Status",
					cell: (order) => (
						<span className={styles.status}>
							{formatStatus(order.status)}
						</span>
					),
				},
				{
					header: "Total",
					align: "end",
					cell: (order) =>
						formatMoney({
							amount: order.subtotalAmount,
							currency: order.currency,
						}),
				},
			]}
		/>
	);
}
