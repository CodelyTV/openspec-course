import Link from "next/link";

import type { MyOrderResponse } from "@/contexts/backend/orders/application/list-mine/UserOrdersLister";
import { Table } from "@/contexts/frontend/design-system/molecules/Table";

import {
	formatDeliveryMethod,
	formatMoney,
	formatShortDate,
	formatStatus,
} from "../ui/format";

import styles from "./orders.module.scss";

export function CustomerOrdersTable({
	orders,
}: {
	orders: MyOrderResponse[];
}): React.JSX.Element {
	if (orders.length === 0) {
		return <p>You haven&apos;t placed any orders yet.</p>;
	}

	return (
		<Table
			label="My orders"
			rows={orders}
			rowKey={(order) => order.id}
			columns={[
				{
					header: "Order",
					cell: (order) => (
						<Link
							href={`/account/orders/${order.id}`}
							className={styles.link}
						>
							{order.id}
						</Link>
					),
				},
				{
					header: "Date",
					cell: (order) => formatShortDate(order.createdAt),
				},
				{
					header: "Delivery",
					cell: (order) => formatDeliveryMethod(order.deliveryMethod),
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
