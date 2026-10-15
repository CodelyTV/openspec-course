import { OutfitNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitNotFoundError";
import {
	jsonBodyOf,
	requiredString,
	requiredStringArray,
} from "@/contexts/backend/shared/infrastructure/http/requestBody";
import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const dynamic = "force-dynamic";

type OutfitRouteContext = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
	async (_request: Request, { params }: OutfitRouteContext) => {
		const { id } = await params;
		const outfit = await retailContainer.outfitFinder.find(id);

		if (outfit === null) {
			throw new OutfitNotFoundError(id);
		}

		return Response.json(outfit);
	},
);

export const PUT = withErrorHandling(
	async (request: Request, { params }: OutfitRouteContext) => {
		const { id } = await params;
		const body = await jsonBodyOf(request);

		await retailContainer.outfitUpdater.update(
			id,
			requiredString(body, "name"),
			requiredStringArray(body, "productIds"),
		);

		return new Response(null, { status: 204 });
	},
);

export const DELETE = withErrorHandling(
	async (_request: Request, { params }: OutfitRouteContext) => {
		const { id } = await params;

		await retailContainer.outfitDeleter.delete(id);

		return new Response(null, { status: 204 });
	},
);
