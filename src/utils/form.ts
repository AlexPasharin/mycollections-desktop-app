const EMPTY_PLACEHOLDER = "(none)";

export const orPlaceholder = (value: string | null): string =>
  value ?? EMPTY_PLACEHOLDER;
