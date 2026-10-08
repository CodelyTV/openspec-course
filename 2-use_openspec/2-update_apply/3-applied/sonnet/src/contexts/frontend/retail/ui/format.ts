import type { MoneyPrimitives } from "@/contexts/shared/domain/Money";

export function formatMoney(money: MoneyPrimitives): string {
	return new Intl.NumberFormat("en-GB", {
		style: "currency",
		currency: money.currency,
		maximumFractionDigits: 0,
	}).format(money.amount);
}

const noAmount = "—";

export function formatOptionalMoney(money: MoneyPrimitives | null): string {
	return money ? formatMoney(money) : noAmount;
}

export function formatMoneyPerCurrency(amounts: MoneyPrimitives[]): string {
	return amounts.length > 0 ? amounts.map(formatMoney).join(" · ") : noAmount;
}

const statusLabels: Record<string, string> = {
	confirmed: "Confirmed",
	draft: "Draft",
};

const deliveryLabels: Record<string, string> = {
	"home-delivery": "Home delivery",
	"store-pickup": "Store pickup",
};

export function formatStatus(status: string): string {
	return statusLabels[status] ?? status;
}

export function formatDeliveryMethod(deliveryMethod: string): string {
	return deliveryLabels[deliveryMethod] ?? deliveryMethod;
}

export function variantLabel(color: string, size: string): string {
	return `${color} / ${size}`;
}

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

const dayAndMonthFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "short",
});

export function formatShortDate(isoDate: string): string {
	return shortDateFormatter.format(new Date(isoDate));
}

export function formatLongDate(isoDate: string): string {
	return longDateFormatter.format(new Date(isoDate));
}

export function formatDayAndMonth(isoDate: string): string {
	return dayAndMonthFormatter.format(new Date(isoDate));
}

export function formatUnits(quantity: number): string {
	return `${quantity} ${quantity === 1 ? "unit" : "units"}`;
}

export function formatOutfitCount(count: number): string {
	return `In ${count} ${count === 1 ? "outfit" : "outfits"}`;
}
