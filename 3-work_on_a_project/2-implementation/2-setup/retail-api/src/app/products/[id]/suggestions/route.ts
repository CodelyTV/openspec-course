import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const dynamic = "force-dynamic";

type ProductSuggestionsRouteContext = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
	async (_request: Request, { params }: ProductSuggestionsRouteContext) => {
		const { id } = await params;

		return Response.json(
			await retailContainer.productSuggestionsFinder.find(id),
		);
	},
);
