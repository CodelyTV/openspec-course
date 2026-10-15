import type { Metadata } from "next";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";
import { PendingReviewsList } from "@/contexts/frontend/retail/sections/PendingReviewsList";

import { ModerateReviewForm } from "./ModerateReviewForm";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage(): Promise<React.JSX.Element> {
	const pendingReviews = await retailApi.pendingReviewsLister.list();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Reviews"
				title="Reviews"
				description="Customer reviews awaiting moderation, oldest first. Approved reviews appear on their product page."
			/>
			<PendingReviewsList
				reviews={pendingReviews}
				actionsFor={(review) => (
					<ModerateReviewForm reviewId={review.id} />
				)}
			/>
		</div>
	);
}
