import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { OrderDetail } from "@/contexts/frontend/retail/sections/OrderDetail";

type AdminOrderDetailPageProps = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({
	params,
}: AdminOrderDetailPageProps): Promise<Metadata> {
	return { title: `Order ${(await params).id}` };
}

export default async function AdminOrderDetailPage({
	params,
}: AdminOrderDetailPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const order = await retailApi.orderFinder.find(id);

	if (!order) {
		notFound();
	}

	return <OrderDetail order={order} audience="admin" />;
}
