import { useRef } from 'react';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

const useDebounce = <T extends any[]>(
  func: (...args: T) => void,
  time: number
): (() => void) => {
  const timer = useRef<null | ReturnType<typeof setTimeout>>(null);

  const call = (...args: T) => {
    const later = async () => {
      timer.current = null;
      func(...args);
    };

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(later, time);
  };

  return call;
};

export const usePersistedState = <T>(
  defaultValue: T,
  key: string
): [T, Dispatch<SetStateAction<T>>] => {
  // Lazy init state
  const [value, setValue] = useState(() => {
    const savedValue = window.localStorage.getItem(key);
    return savedValue !== null ? JSON.parse(savedValue) : defaultValue;
  });

  // Debounce local storage writes
  const setLocalStorage = useDebounce(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, 300);

  // Write to local storage on set item
  useEffect(setLocalStorage, [key, value]);

  return [value, setValue];
};
