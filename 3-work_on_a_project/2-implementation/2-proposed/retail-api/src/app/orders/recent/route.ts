import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

export const dynamic = "force-dynamic";

function limitOf(request: Request): number {
	const limit = Number(new URL(request.url).searchParams.get("limit"));

	if (!Number.isInteger(limit) || limit <= 0) {
		throw new InvalidArgumentError("limit must be a positive integer");
	}

	return limit;
}

export const GET = withErrorHandling(async (request: Request) =>
	Response.json(
		await retailContainer.recentOrdersLister.list(limitOf(request)),
	),
);
