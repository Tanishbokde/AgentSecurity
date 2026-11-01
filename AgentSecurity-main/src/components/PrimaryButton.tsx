import React from 'react';
import { Button } from './Button';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  isLoading = false,
  children = 'SECURE SIGN IN',
  disabled,
  className = '',
  type = 'submit',
  ...props
}) => {
  return (
    <Button
      variant="primary"
      size="lg"
      type={type}
      isLoading={isLoading}
      disabled={disabled}
      className={`w-full font-display font-bold text-[14px] tracking-widest ${className}`}
      {...(props as any)}
    >
      {children}
    </Button>
  );
};
