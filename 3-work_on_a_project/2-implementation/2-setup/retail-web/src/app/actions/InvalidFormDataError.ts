export class InvalidFormDataError extends Error {
	readonly type = "InvalidFormDataError";

	constructor(message: string) {
		super(message);
		this.name = "InvalidFormDataError";
	}
}
