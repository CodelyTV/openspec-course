export type Currency = "EUR" | "USD";

export type MoneyPrimitives = { amount: number; currency: Currency };

export type Size = "XS" | "S" | "M" | "L" | "XL";

export type ProductAccent = "green" | "violet" | "yellow" | "pink";

export type ProductColor = { name: string; hex: string };

export type SizeGuideRow = { size: Size; chest: number; length: number };

export type ProductFilters = { collection?: string; category?: string };

export type ProductVariantResponse = {
	id: string;
	color: string;
	colorHex: string;
	size: Size;
	onlineStock: number;
	measurements: { chest: number; length: number };
	hasStock: boolean;
	isLowStock: boolean;
};

export type ProductResponse = {
	id: string;
	name: string;
	collection: string;
	category: string;
	description: string;
	price: MoneyPrimitives;
	badges: string[];
	accent: ProductAccent;
	variants: ProductVariantResponse[];
	colors: ProductColor[];
	sizeGuide: SizeGuideRow[];
	totalOnlineStock: number;
	firstAvailableVariantId: string | null;
};

export type OutfitSuggestionResponse = {
	name: string;
	products: ProductResponse[];
};

export type ProductSuggestionsResponse =
	| { kind: "outfits"; outfits: OutfitSuggestionResponse[] }
	| { kind: "collection"; products: ProductResponse[] };

export type OutfitResponse = {
	id: string;
	name: string;
	productIds: string[];
};

export type OutfitSummaryResponse = {
	id: string;
	name: string;
	productCount: number;
	outOfStockProductNames: string[];
};

export type InventoryResponse = {
	productName: string;
	collection: string;
	color: string;
	size: Size;
	stock: number;
	low: boolean;
	inOutfit: boolean;
};

export type InventoryReportResponse = {
	variants: InventoryResponse[];
	lowStockCount: number;
};

export type LowStockResponse = {
	productName: string;
	color: string;
	size: Size;
	stock: number;
	outfitCount: number;
};

export type LowStockReportResponse = {
	threshold: number;
	variants: LowStockResponse[];
};

export type CheckoutLineResponse = {
	variantId: string;
	productName: string;
	color: string;
	size: string;
	quantity: number;
	price: MoneyPrimitives;
	lineTotal: MoneyPrimitives;
};

export type CheckoutResponse = {
	status: string;
	subtotal: MoneyPrimitives | null;
	lines: CheckoutLineResponse[];
};

export type OrderResponse = {
	id: string;
	createdAt: string;
	status: string;
	customerName: string;
	subtotalAmount: number;
	currency: Currency;
	items: number;
};

export type MyOrderResponse = {
	id: string;
	createdAt: string;
	status: string;
	deliveryMethod: string;
	subtotalAmount: number;
	currency: Currency;
	items: number;
};

export type OrderDetailLineResponse = {
	productName: string;
	color: string;
	size: string;
	quantity: number;
	unitPriceAmount: number;
};

export type OrderDetailResponse = {
	id: string;
	userId: string;
	customerName: string;
	createdAt: string;
	status: string;
	deliveryMethod: string;
	subtotalAmount: number;
	currency: Currency;
	lines: OrderDetailLineResponse[];
};

export type OrdersSummaryResponse = {
	ordersCount: number;
	revenuePerCurrency: MoneyPrimitives[];
	averageOrderPerCurrency: MoneyPrimitives[];
};

export type CurrentUserResponse = { id: string; name: string; email: string };

export type ProductReviewResponse = {
	id: string;
	rating: number;
	title: string;
	body: string;
	authorName: string;
	createdAt: string;
};

export type ProductReviewsResponse = {
	averageRating: number | null;
	reviewCount: number;
	reviews: ProductReviewResponse[];
};

export type ReviewEligibilityStatus =
	"can-review" | "pending-review" | "already-reviewed" | "not-purchased";

export type ReviewEligibilityResponse = { status: ReviewEligibilityStatus };

export type PendingReviewResponse = {
	id: string;
	productId: string;
	productName: string;
	authorName: string;
	rating: number;
	title: string;
	body: string;
	createdAt: string;
};
