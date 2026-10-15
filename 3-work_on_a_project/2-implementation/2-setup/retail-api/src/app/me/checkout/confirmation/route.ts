import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const POST = withErrorHandling(async () => {
	const orderId = await retailContainer.checkoutConfirmer.confirm();

	return Response.json({ orderId }, { status: 201 });
});
