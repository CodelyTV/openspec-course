import type { ProductId } from "@/contexts/shared/domain/ProductId";
import type { UserId } from "@/contexts/shared/domain/UserId";

import type { Review } from "./Review";
import type { ReviewId } from "./ReviewId";

export abstract class ReviewRepository {
	abstract save(review: Review): Promise<void>;

	abstract search(id: ReviewId): Promise<Review | null>;

	abstract searchByProductAndAuthor(
		productId: ProductId,
		authorId: UserId,
	): Promise<Review | null>;

	abstract searchApprovedByProduct(productId: ProductId): Promise<Review[]>;

	abstract searchPending(): Promise<Review[]>;
}
