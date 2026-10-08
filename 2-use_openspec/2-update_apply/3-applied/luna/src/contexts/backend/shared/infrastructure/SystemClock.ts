import { Clock } from "@/contexts/shared/domain/Clock";

export class SystemClock extends Clock {
	now(): Date {
		return new Date();
	}
}
