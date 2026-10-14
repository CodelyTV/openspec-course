import type { ActionState } from "../ActionState";

export type RestockAlertActionState = ActionState & { isAlertActive: boolean };

export const initialRestockAlertActionState: RestockAlertActionState = {
	error: null,
	isAlertActive: false,
};
