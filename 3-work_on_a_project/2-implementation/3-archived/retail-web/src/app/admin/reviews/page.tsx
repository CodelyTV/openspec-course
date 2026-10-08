import type { Metadata } from "next";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import { PendingReviewsList } from "./PendingReviewsList";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage(): Promise<React.JSX.Element> {
	const pendingReviews = await retailApi.pendingReviewsLister.list();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Reviews"
				title="Reviews"
				description="Pending customer reviews, oldest first. Approved reviews are shown on their product page."
			/>
			<PendingReviewsList reviews={pendingReviews} />
		</div>
	);
}
