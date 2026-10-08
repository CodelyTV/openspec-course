import { CurrencyMismatchError } from "./errors/CurrencyMismatchError";
import { InvalidMoneyAmountError } from "./errors/InvalidMoneyAmountError";
import { parseLiteral } from "./parseLiteral";

export const currencies = ["EUR", "USD"] as const;

export type Currency = (typeof currencies)[number];

export function parseCurrency(value: string): Currency {
	return parseLiteral("currency", currencies, value);
}

export type MoneyPrimitives = {
	amount: number;
	currency: Currency;
};

export class Money {
	constructor(
		public readonly amount: number,
		public readonly currency: Currency,
	) {
		const isNonNegativeWholeAmount =
			Number.isInteger(amount) && amount >= 0;

		if (!isNonNegativeWholeAmount) {
			throw new InvalidMoneyAmountError(amount);
		}

		parseCurrency(currency);
	}

	static fromPrimitives(primitives: MoneyPrimitives): Money {
		return new Money(primitives.amount, primitives.currency);
	}

	add(other: Money): Money {
		this.ensureSameCurrencyAs(other);

		return new Money(this.amount + other.amount, this.currency);
	}

	multiply(factor: number): Money {
		return new Money(this.amount * factor, this.currency);
	}

	equals(other: Money): boolean {
		return this.amount === other.amount && this.currency === other.currency;
	}

	toPrimitives(): MoneyPrimitives {
		return { amount: this.amount, currency: this.currency };
	}

	private ensureSameCurrencyAs(other: Money): void {
		if (this.currency !== other.currency) {
			throw new CurrencyMismatchError(this.currency, other.currency);
		}
	}
}
