import {
	type ProductResponse,
	toProductResponse,
} from "@/contexts/backend/products/application/ProductResponse";
import type { ProductPrimitives } from "@/contexts/backend/products/domain/Product";

import { ProductMother } from "../../../backend/products/domain/ProductMother";

export class ProductResponseMother {
	static create(overrides: Partial<ProductPrimitives> = {}): ProductResponse {
		return toProductResponse(ProductMother.create(overrides));
	}
}
