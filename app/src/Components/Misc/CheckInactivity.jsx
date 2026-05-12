'use client';
import { useEffect, useRef } from 'react';

const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

const useInactivity = (callback, delay) => {
  const timeoutRef = useRef(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      // Clear existing timer if user is active
      clearTimeout(timeoutRef.current);
    }
    // Restart timer for the set amount of time
    timeoutRef.current = setTimeout(callback, delay);
  };

  useEffect(() => {
    // Events that count as "activity"
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Throttle resetTimer to run at most once per second
    const throttledResetTimer = throttle(resetTimer, 1000);

    // Start timer on initial mount
    resetTimer();

    // Add event listeners to detect activity
    events.forEach((event) => {
      window.addEventListener(event, throttledResetTimer);
    });

    // Cleanup: Remove listeners and clear timer when component unmounts
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledResetTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [callback, delay]);
};

export default useInactivity;