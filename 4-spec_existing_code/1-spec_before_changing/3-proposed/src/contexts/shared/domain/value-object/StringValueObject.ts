import { EmptyStringValueObjectError } from "../errors/EmptyStringValueObjectError";

export abstract class StringValueObject {
	constructor(public readonly value: string) {
		if (value.trim().length === 0) {
			throw new EmptyStringValueObjectError(new.target.name);
		}
	}

	equals(other: StringValueObject): boolean {
		return (
			this.constructor === other.constructor && this.value === other.value
		);
	}
}
