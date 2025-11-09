import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerProps {
  initialSeconds: number;
  onEnd?: () => void;
}

export const useTimer = ({ initialSeconds, onEnd }: UseTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const onEndRef = useRef(onEnd);

  // Keep onEnd callback fresh to prevent stale closures
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);


  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (onEndRef.current) {
              onEndRef.current();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);
  
  return { timeLeft, isRunning, start, pause, reset };
};
