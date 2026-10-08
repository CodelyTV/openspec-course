import {
	jsonBodyOf,
	requiredNumber,
	requiredString,
} from "@/contexts/backend/shared/infrastructure/http/requestBody";
import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const POST = withErrorHandling(async (request: Request) => {
	const body = await jsonBodyOf(request);

	await retailContainer.reviewSubmitter.submit({
		productId: requiredString(body, "productId"),
		rating: requiredNumber(body, "rating"),
		title: requiredString(body, "title"),
		body: requiredString(body, "body"),
	});

	return new Response(null, { status: 201 });
});
