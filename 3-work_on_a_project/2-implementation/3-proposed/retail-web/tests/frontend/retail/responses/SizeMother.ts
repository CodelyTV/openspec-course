import { faker } from "@faker-js/faker";

import type { Size } from "@/contexts/frontend/retail/api/responses";

export const sizesInDisplayOrder: Size[] = ["XS", "S", "M", "L", "XL"];

export class SizeMother {
	static create(): Size {
		return faker.helpers.arrayElement(sizesInDisplayOrder);
	}
}
