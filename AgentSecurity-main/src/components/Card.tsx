import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'featured' | 'strong';
  hoverEffect?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverEffect = true,
  children,
  className = '',
  ...props
}) => {
  const variantClass =
    variant === 'featured'
      ? 'glass-card-featured'
      : variant === 'strong'
      ? 'glass-strong rounded-2xl'
      : 'glass-card';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={hoverEffect ? { y: -2 } : undefined}
      className={`${variantClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

