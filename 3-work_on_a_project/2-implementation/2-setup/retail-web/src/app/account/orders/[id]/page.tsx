import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { OrderDetail } from "@/contexts/frontend/retail/sections/OrderDetail";

type AccountOrderDetailPageProps = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({
	params,
}: AccountOrderDetailPageProps): Promise<Metadata> {
	return { title: `Order ${(await params).id}` };
}

export default async function AccountOrderDetailPage({
	params,
}: AccountOrderDetailPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const order = await retailApi.userOrderFinder.find(id);

	if (!order) {
		notFound();
	}

	return <OrderDetail order={order} audience="customer" />;
}
