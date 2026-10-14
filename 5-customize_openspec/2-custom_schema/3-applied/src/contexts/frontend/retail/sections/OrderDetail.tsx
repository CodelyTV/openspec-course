import Link from "next/link";
import type { ReactNode } from "react";

import type {
	OrderDetailLineResponse,
	OrderDetailResponse,
} from "@/contexts/backend/orders/application/find/OrderFinder";
import { Table } from "@/contexts/frontend/design-system/molecules/Table";

import {
	formatDeliveryMethod,
	formatLongDate,
	formatMoney,
	formatStatus,
	variantLabel,
} from "../ui/format";

import { PageHeader } from "./PageHeader";

import styles from "./orders.module.scss";

type OrderDetailProps = {
	order: OrderDetailResponse;
	audience: "customer" | "admin";
	cancelForm?: ReactNode;
};

const backLinks = {
	customer: { href: "/account/orders", label: "My orders" },
	admin: { href: "/admin/orders", label: "Orders" },
};

function lineKey(line: OrderDetailLineResponse): string {
	return `${line.productName}-${line.color}-${line.size}`;
}

export function OrderDetail({
	order,
	audience,
	cancelForm,
}: OrderDetailProps): React.JSX.Element {
	const backLink = backLinks[audience];
	const canBeCancelledByTheCustomer =
		audience === "customer" && order.status === "confirmed";
	const facts = [
		audience === "admin"
			? { label: "Customer", value: order.customerName }
			: {
					label: "Delivery",
					value: formatDeliveryMethod(order.deliveryMethod),
				},
		{ label: "Date", value: formatLongDate(order.createdAt) },
		{ label: "Status", value: formatStatus(order.status) },
		{
			label: "Total",
			value: formatMoney({
				amount: order.subtotalAmount,
				currency: order.currency,
			}),
		},
	];

	return (
		<div>
			<Link href={backLink.href} className={styles.back}>
				← {backLink.label}
			</Link>
			<PageHeader size="compact" eyebrow="Order" title={order.id} />

			<dl className={styles.summary}>
				{facts.map((fact) => (
					<div key={fact.label} className={styles.summaryItem}>
						<dt className={styles.summaryLabel}>{fact.label}</dt>
						<dd className={styles.summaryValue}>{fact.value}</dd>
					</div>
				))}
			</dl>

			{canBeCancelledByTheCustomer && cancelForm}

			<Table
				label="Order lines"
				rows={order.lines}
				rowKey={lineKey}
				columns={[
					{ header: "Product", cell: (line) => line.productName },
					{
						header: "Variant",
						cell: (line) => variantLabel(line.color, line.size),
					},
					{ header: "Units", cell: (line) => line.quantity },
					{
						header: "Line total",
						align: "end",
						cell: (line) =>
							formatMoney({
								amount: line.unitPriceAmount * line.quantity,
								currency: order.currency,
							}),
					},
				]}
			/>
		</div>
	);
}
