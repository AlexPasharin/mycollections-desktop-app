import { useEffect, useState } from "react";

export type DebouncedValueResult = readonly [
  debouncedValue: string,
  isDebouncing: boolean,
];

export const useDebouncedValue = (
  value: string,
  delayMs: number,
): DebouncedValueResult => {
  const [debouncedValue, setDebouncedValue] = useState(value.trim());
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setDebouncedValue(trimmedValue);
      setIsDebouncing(false);

      return;
    }

    setIsDebouncing(true);

    const timeout = setTimeout(() => {
      setDebouncedValue(trimmedValue);
      setIsDebouncing(false);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
      setIsDebouncing(false);
    };
  }, [value, delayMs]);

  return [debouncedValue, isDebouncing];
};
