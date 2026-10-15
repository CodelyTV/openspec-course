import { OrderNotFoundError } from "@/contexts/backend/orders/domain/errors/OrderNotFoundError";
import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const dynamic = "force-dynamic";

type OrderRouteContext = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
	async (_request: Request, { params }: OrderRouteContext) => {
		const { id } = await params;
		const order = await retailContainer.userOrderFinder.find(id);

		if (order === null) {
			throw new OrderNotFoundError(id);
		}

		return Response.json(order);
	},
);
