import {
	jsonBodyOf,
	requiredString,
} from "@/contexts/backend/shared/infrastructure/http/requestBody";
import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const POST = withErrorHandling(async (request: Request) => {
	const body = await jsonBodyOf(request);

	await retailContainer.cartVariantAdder.add(
		requiredString(body, "variantId"),
	);

	return new Response(null, { status: 204 });
});
