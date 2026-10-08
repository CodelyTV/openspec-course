import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
	const { searchParams } = new URL(request.url);

	return Response.json(
		await retailContainer.productsSearcher.search({
			collection: searchParams.get("collection") ?? undefined,
			category: searchParams.get("category") ?? undefined,
		}),
	);
});
