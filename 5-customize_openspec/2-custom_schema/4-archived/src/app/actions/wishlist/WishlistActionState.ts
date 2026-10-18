import type { ActionState } from "../ActionState";

export type WishlistActionState = ActionState & { isSaved: boolean };
