import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

export const dynamic = "force-dynamic";

function productIdOf(request: Request): string {
	const productId = new URL(request.url).searchParams.get("productId");
	const isMissingProductId = productId === null || productId.trim() === "";

	if (isMissingProductId) {
		throw new InvalidArgumentError("productId is required");
	}

	return productId;
}

export const GET = withErrorHandling(async (request: Request) =>
	Response.json(
		await retailContainer.reviewEligibilityChecker.check(
			productIdOf(request),
		),
	),
);
