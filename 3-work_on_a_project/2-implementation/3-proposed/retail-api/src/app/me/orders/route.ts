import { withErrorHandling } from "@/contexts/backend/shared/infrastructure/http/withErrorHandling";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () =>
	Response.json(await retailContainer.userOrdersLister.list()),
);
