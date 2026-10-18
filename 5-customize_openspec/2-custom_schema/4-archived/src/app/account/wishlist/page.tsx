import type { Metadata } from "next";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";
import { ProductGrid } from "@/contexts/frontend/retail/sections/ProductGrid";

export const metadata: Metadata = { title: "Wishlist" };

export default async function AccountWishlistPage(): Promise<React.JSX.Element> {
	const products = await retailContainer.customerWishlistFinder.find();

	return (
		<div>
			<PageHeader size="compact" title="Wishlist" />
			<ProductGrid
				products={products}
				emptyMessage="Your wishlist is empty."
			/>
		</div>
	);
}
