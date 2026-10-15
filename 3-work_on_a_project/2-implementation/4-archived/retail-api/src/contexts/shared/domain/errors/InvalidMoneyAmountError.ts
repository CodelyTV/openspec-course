import { CodelyError } from "../CodelyError";

export class InvalidMoneyAmountError extends CodelyError {
	constructor(amount: number) {
		super(`Money amount must be a non-negative integer, got ${amount}`);
	}
}
