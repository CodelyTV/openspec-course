import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const dynamic = "force-dynamic";

type ReviewEligibilityRouteContext = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
	async (_request: Request, { params }: ReviewEligibilityRouteContext) => {
		const { id } = await params;

		return Response.json(
			await retailContainer.reviewEligibilityChecker.check(id),
		);
	},
);
