import type { Metadata } from "next";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { CustomerWishlist } from "@/contexts/frontend/retail/sections/CustomerWishlist";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

export const metadata: Metadata = { title: "Wishlist" };

export default async function AccountWishlistPage(): Promise<React.JSX.Element> {
	const products = await retailContainer.customerWishlistLister.list();

	return (
		<div>
			<PageHeader size="compact" title="Wishlist" />
			<CustomerWishlist products={products} />
		</div>
	);
}
