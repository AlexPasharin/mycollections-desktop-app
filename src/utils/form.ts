import type { FormFeedback } from "@/types/form";

const EMPTY_PLACEHOLDER = "(none)";

export const orPlaceholder = (value?: string | null): string =>
  value?.trim() ? value : EMPTY_PLACEHOLDER;

export const formFeedbackInitialValue: FormFeedback = {
  notifications: [],
  errors: [],
};
