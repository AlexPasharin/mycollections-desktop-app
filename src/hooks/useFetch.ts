import { useEffect, useEffectEvent, useRef, useState } from "react";

type UseFetchOptions<U> = {
  skip?: boolean;

  /** When `skip` is true, reset `data`, `error`, and `isLoading` instead of keeping the last result. Defaults to true. */
  clearOnSkip?: boolean;

  /** An error message to log to the console if the fetch fails. */
  errorMessage?: string;

  onSuccess?: (data: U) => void;
  onError?: (error: unknown) => void;
  onFinally?: () => void;
};

const useFetch = <TArgs extends readonly unknown[], U>(
  fetcher: (...args: TArgs) => Promise<U>,
  args: TArgs,
  {
    skip,
    clearOnSkip = true,
    errorMessage,
    onSuccess,
    onError,
    onFinally,
  }: UseFetchOptions<U> = {},
) => {
  const [data, setData] = useState<U | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(!skip);

  const fetchTokenRef = useRef(0);
  const stableArgs = useShallowStableArray(args);

  const runFetch = useEffectEvent((...callArgs: TArgs) => fetcher(...callArgs));

  const handleSuccess = useEffectEvent((result: U) => {
    onSuccess?.(result);
  });

  const handleError = useEffectEvent((fetchError: unknown) => {
    onError?.(fetchError);

    if (errorMessage) {
      console.error(errorMessage, fetchError);
    }
  });

  const handleFinally = useEffectEvent(() => {
    onFinally?.();
  });

  useEffect(() => {
    if (skip) {
      if (clearOnSkip) {
        setData(null);
        setError(null);
        setIsLoading(false);
      }

      return;
    }

    const token = ++fetchTokenRef.current;

    setIsLoading(true);
    setError(null);

    runFetch(...stableArgs)
      .then((result) => {
        if (fetchTokenRef.current === token) {
          setData(result);
          handleSuccess(result);
        }
      })
      .catch((fetchError: unknown) => {
        if (fetchTokenRef.current === token) {
          setError(fetchError);
        }

        handleError(fetchError);
      })
      .finally(() => {
        if (fetchTokenRef.current === token) {
          setIsLoading(false);
          handleFinally();
        }
      });
  }, [stableArgs, skip, clearOnSkip]);

  useEffect(() => {
    // invalidate all pending in-flight requests on component unmount
    return () => {
      fetchTokenRef.current += 1;
    };
  }, []);

  return {
    data,
    setData,
    error,
    isLoading,
  };
};

export default useFetch;

const useShallowStableArray = <T extends readonly unknown[]>(value: T): T => {
  const ref = useRef(value);

  const isSame =
    ref.current.length === value.length &&
    ref.current.every((item, index) => Object.is(item, value[index]));

  if (!isSame) {
    ref.current = value;
  }

  return ref.current;
};
