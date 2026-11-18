import { useEffect, useState } from "react";

export type DebouncedValueResult = readonly [
  debouncedValue: string,
  isDebouncing: boolean,
];

/**
 * Debounces a search-style string. The value is trimmed, and clearing the
 * input applies immediately instead of waiting for the delay.
 */
export const useDebouncedValue = (
  value: string,
  delayMs: number,
): DebouncedValueResult => {
  const trimmedValue = value.trim();
  const [debouncedValue, setDebouncedValue] = useState(trimmedValue);

  useEffect(() => {
    if (!trimmedValue) {
      setDebouncedValue(trimmedValue);

      return;
    }

    const timeout = setTimeout(() => {
      setDebouncedValue(trimmedValue);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [trimmedValue, delayMs]);

  // Derived during render so it is correct on the same render the input
  // changes, with no extra state or effect-driven re-render.
  const isDebouncing = Boolean(trimmedValue) && trimmedValue !== debouncedValue;

  return [debouncedValue, isDebouncing];
};
