//Gets previous value of a state variable
import { useRef, useEffect } from 'react';

export default function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
