import { useEffect, useState } from "react";

export const useDebouncedValue = <T extends string>(
  value: T,
  delayMs: number,
): T => {
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

  return debouncedValue;
};
