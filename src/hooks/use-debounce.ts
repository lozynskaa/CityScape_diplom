import React from "react";

export function useDebounce<T>(value: T, delay = 500) {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
}

export function useLoadingDebounce<T>(value: T, delay = 500) {
  const [pending, setPending] = React.useState(false);
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    setPending(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setPending(false);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return { pending, debouncedValue };
}
