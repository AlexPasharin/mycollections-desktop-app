import type { FormFeedback } from "@/types/form";

const EMPTY_PLACEHOLDER = "(none)";

export const orPlaceholder = (value: string | null): string =>
  value ?? EMPTY_PLACEHOLDER;

export const formFeedbackInitialValue: FormFeedback = {
  notifications: [],
  errors: [],
};
