import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

type CheckoutLineRouteContext = { params: Promise<{ id: string }> };

export const DELETE = withErrorHandling(
	async (_request: Request, { params }: CheckoutLineRouteContext) => {
		const { id: variantId } = await params;

		await retailContainer.cartVariantRemover.remove(variantId);

		return new Response(null, { status: 204 });
	},
);
