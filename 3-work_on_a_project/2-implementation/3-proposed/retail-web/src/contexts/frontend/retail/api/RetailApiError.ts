type ErrorBody = { error?: { type?: unknown; message?: unknown } };

const unexpectedResponseType = "UnexpectedResponseError";

export class RetailApiError extends Error {
	constructor(
		readonly status: number,
		readonly type: string,
		message: string,
	) {
		super(message);
		this.name = "RetailApiError";
	}

	static async fromResponse(response: Response): Promise<RetailApiError> {
		const body = await RetailApiError.errorBodyOf(response);
		const type = body.error?.type;
		const message = body.error?.message;

		return new RetailApiError(
			response.status,
			typeof type === "string" ? type : unexpectedResponseType,
			typeof message === "string"
				? message
				: `Retail API responded with status ${response.status}`,
		);
	}

	private static async errorBodyOf(response: Response): Promise<ErrorBody> {
		try {
			return (await response.json()) as ErrorBody;
		} catch {
			return {};
		}
	}
}
