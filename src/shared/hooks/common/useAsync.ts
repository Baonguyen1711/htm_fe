// Async operations hook
import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useAsync = <T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) => {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mountedRef = useRef(true);
  const lastCallId = useRef(0);

  const execute = useCallback(
    async (...args: any[]) => {
      const callId = ++lastCallId.current;
      
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFunction(...args);
        
        // Only update state if this is the most recent call and component is mounted
        if (callId === lastCallId.current && mountedRef.current) {
          setState({ data, loading: false, error: null });
          onSuccess?.(data);
        }
        
        return data;
      } catch (error: any) {
        // Only update state if this is the most recent call and component is mounted
        if (callId === lastCallId.current && mountedRef.current) {
          const errorMessage = error?.message || 'An error occurred';
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          onError?.(error);
        }
        
        throw error;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
};

export default useAsync;
