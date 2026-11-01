import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 800,
  decimals,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const numericTarget = typeof value === 'number' ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numericTarget);

  const [displayValue, setDisplayValue] = useState<number>(() => (isNumeric ? numericTarget : 0));
  const currentValRef = useRef<number>(isNumeric ? numericTarget : 0);

  useEffect(() => {
    if (!isNumeric) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(numericTarget);
      currentValRef.current = numericTarget;
      return;
    }

    let startTime: number | null = null;
    let animId: number;

    const startVal = currentValRef.current;
    const diff = numericTarget - startVal;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = startVal + diff * eased;
      currentValRef.current = nextVal;
      setDisplayValue(nextVal);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        currentValRef.current = numericTarget;
        setDisplayValue(numericTarget);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [numericTarget, duration, isNumeric]);

  if (!isNumeric) {
    return <span className={`tabular-nums ${className}`}>{String(value)}</span>;
  }

  const determinedDecimals =
    decimals !== undefined
      ? decimals
      : String(value).includes('.')
      ? String(value).split('.')[1]?.length || 1
      : 0;

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {displayValue.toFixed(determinedDecimals)}
      {suffix}
    </span>
  );
};
