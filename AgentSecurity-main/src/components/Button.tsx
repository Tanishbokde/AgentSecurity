import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[#FF2A2A] via-[#E10600] to-[#8B0000] text-white border border-[rgba(192,192,192,0.35)] shadow-[0_0_20px_rgba(225,6,0,0.45)] hover:shadow-[0_0_30px_rgba(225,6,0,0.65)] hover:border-[rgba(232,232,236,0.6)] font-bold',
  secondary:
    'bg-[rgba(15,15,18,0.7)] text-[#E8E8EC] border border-[rgba(192,192,192,0.22)] shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:border-[#E10600] hover:text-white hover:shadow-[0_0_20px_rgba(225,6,0,0.35)] font-semibold',
  ghost:
    'bg-transparent text-[#C0C0C0] border border-transparent hover:border-[rgba(225,6,0,0.4)] hover:bg-[rgba(225,6,0,0.08)] hover:text-white hover:shadow-[0_0_15px_rgba(225,6,0,0.25)] font-medium',
  danger:
    'bg-[#8B0000] hover:bg-[#E10600] text-white border border-[#FF2A2A]/40 shadow-[0_0_20px_rgba(225,6,0,0.5)] hover:shadow-[0_0_30px_rgba(255,42,42,0.7)] font-bold',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-xs tracking-wider uppercase rounded-xl gap-2',
  lg: 'h-11 px-5 text-sm tracking-wider uppercase rounded-xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled || isLoading}
      className={`btn-sheen inline-flex items-center justify-center select-none transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="w-4 h-4 text-[#C0C0C0] animate-spin motion-reduce:animate-none shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-85"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="truncate">PROCESSING…</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

