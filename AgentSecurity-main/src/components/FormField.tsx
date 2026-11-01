import React, { forwardRef, useState } from 'react';
import { Mail } from 'lucide-react';
import type { FieldError } from 'react-hook-form';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: FieldError;
  icon?: React.ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, error, icon = <Mail size={18} className="text-[#8A8A92]" />, className = '', onFocus, onBlur, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="flex flex-col text-left w-full space-y-1.5">
        <label
          htmlFor={id}
          className="text-[#E8E8EC] text-[13px] font-semibold tracking-wider uppercase select-none font-sans"
        >
          {label}
        </label>
        
        <div
          className={`relative flex items-center w-full h-[44px] rounded-[10px] glass-input transition-all duration-200 ${
            error
              ? 'border-[#E10600] ring-1 ring-[#E10600]/40 shadow-[0_0_12px_rgba(225,6,0,0.25)]'
              : isFocused
              ? 'border-[#FF2A2A] ring-2 ring-[#E10600]/30 shadow-[0_0_18px_rgba(255,42,42,0.35)]'
              : 'hover:border-[rgba(192,192,192,0.3)]'
          }`}
        >
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#8A8A92]">
            {icon}
          </div>

          <input
            id={id}
            ref={ref}
            className={`w-full h-full pl-11 pr-4 bg-transparent text-[#E8E8EC] placeholder-[#8A8A92]/60 text-[14px] rounded-[10px] outline-none font-sans custom-caret ${className}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
        </div>

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-[#FF2A2A] text-[12px] font-medium pt-0.5 tracking-wide"
          >
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
