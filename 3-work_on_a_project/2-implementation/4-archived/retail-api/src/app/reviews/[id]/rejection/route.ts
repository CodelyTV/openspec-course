import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

type ReviewRejectionRouteContext = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(
	async (_request: Request, { params }: ReviewRejectionRouteContext) => {
		const { id } = await params;

		await retailContainer.reviewRejecter.reject(id);

		return new Response(null, { status: 204 });
	},
);
