import { revalidatePath } from "next/cache";

export function revalidateWishlistPages(): void {
	revalidatePath("/products/[id]", "page");
	revalidatePath("/account/wishlist");
}
