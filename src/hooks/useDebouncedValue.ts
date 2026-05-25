import { useEffect, useState } from "react";

export type DebouncedValueResult<T extends string> = readonly [
  debouncedValue: T,
  isDebouncing: boolean,
];

export const useDebouncedValue = <T extends string>(
  value: T,
  delayMs: number,
): DebouncedValueResult<T> => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (value === "") {
      setDebouncedValue(value);

      return;
    }

    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, delayMs]);

  return [debouncedValue, value !== debouncedValue];
};
