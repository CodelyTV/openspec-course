import { httpErrorResponse } from "./httpErrorResponse";

type RouteHandler<Context> = (
	request: Request,
	context: Context,
) => Promise<Response>;

export function withErrorHandling<Context>(
	handler: RouteHandler<Context>,
): RouteHandler<Context> {
	return async (request, context) => {
		try {
			return await handler(request, context);
		} catch (error) {
			return httpErrorResponse(error);
		}
	};
}
