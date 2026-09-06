import { useEffect, useRef, useState } from "react";

type UseFetchWithCancelProps<U> = {
  promise: () => Promise<U>;
  skip?: boolean;
  onSuccess?: (data: U) => void;
  onError?: (error: unknown) => void;
  onFinally?: () => void;
};

const useFetch = <U>({
  promise,
  skip,
  onSuccess,
  onError,
  onFinally,
}: UseFetchWithCancelProps<U>) => {
  const [data, setData] = useState<U | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTokenRef = useRef(0);

  useEffect(() => {
    if (skip) {
      return;
    }

    const token = ++fetchTokenRef.current;

    setIsLoading(true);
    setError(null);

    promise()
      .then((result) => {
        if (fetchTokenRef.current === token) {
          setData(result);
          onSuccess?.(result);
        }
      })
      .catch((fetchError: unknown) => {
        if (fetchTokenRef.current === token) {
          setError(fetchError);
          onError?.(fetchError);
        }
      })
      .finally(() => {
        if (fetchTokenRef.current === token) {
          setIsLoading(false);
          onFinally?.();
        }
      });
  }, [promise, skip, onSuccess, onError, onFinally]);

  return {
    data,
    setData,
    error,
    isLoading,
    fetchToken: fetchTokenRef.current,
  };
};

export default useFetch;
