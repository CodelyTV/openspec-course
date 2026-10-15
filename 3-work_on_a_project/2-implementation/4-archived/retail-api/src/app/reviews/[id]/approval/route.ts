import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

type ReviewApprovalRouteContext = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(
	async (_request: Request, { params }: ReviewApprovalRouteContext) => {
		const { id } = await params;

		await retailContainer.reviewApprover.approve(id);

		return new Response(null, { status: 204 });
	},
);
