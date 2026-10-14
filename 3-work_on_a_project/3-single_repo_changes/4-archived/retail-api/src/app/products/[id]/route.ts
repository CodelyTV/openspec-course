import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const dynamic = "force-dynamic";

type ProductRouteContext = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
	async (_request: Request, { params }: ProductRouteContext) => {
		const { id } = await params;
		const product = await retailContainer.productFinder.find(id);

		if (product === null) {
			throw new ProductNotFoundError(id);
		}

		return Response.json(product);
	},
);
