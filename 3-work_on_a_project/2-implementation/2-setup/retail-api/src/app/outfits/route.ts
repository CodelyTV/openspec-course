import {
	jsonBodyOf,
	requiredString,
	requiredStringArray,
} from "@/contexts/backend/shared/infrastructure/http/requestBody";
import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () =>
	Response.json(await retailContainer.outfitsLister.list()),
);

export const POST = withErrorHandling(async (request: Request) => {
	const body = await jsonBodyOf(request);

	await retailContainer.outfitCreator.create(
		requiredString(body, "name"),
		requiredStringArray(body, "productIds"),
	);

	return new Response(null, { status: 201 });
});
