import type { ProductId } from "@/contexts/shared/domain/ProductId";

import type { Outfit } from "./Outfit";
import type { OutfitId } from "./OutfitId";
import type { OutfitName } from "./OutfitName";

export abstract class OutfitRepository {
	abstract save(outfit: Outfit): Promise<void>;
	abstract search(id: OutfitId): Promise<Outfit | null>;
	abstract searchByName(name: OutfitName): Promise<Outfit | null>;
	abstract searchAll(): Promise<Outfit[]>;
	abstract searchContaining(productId: ProductId): Promise<Outfit[]>;
	abstract delete(id: OutfitId): Promise<void>;
}
