import { useEffect } from "react";

/** Keeps a URL search param in sync with React state (replaceState, no navigation). */
export const useSyncSearchParam = (key: string, value: string) => {
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get(key) === value) {
      return;
    }

    url.searchParams.set(key, value);
    window.history.replaceState(null, "", url.toString());
  }, [key, value]);
};
