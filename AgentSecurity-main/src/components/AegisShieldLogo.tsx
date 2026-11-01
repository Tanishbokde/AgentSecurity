import React, { useId } from 'react';

interface AegisShieldLogoProps {
  size?: number;
  className?: string;
  variant?: 'header' | 'card' | 'watermark';
}

export const AegisShieldLogo: React.FC<AegisShieldLogoProps> = ({
  size = 32,
  className = '',
  variant = 'header',
}) => {
  const rawId = useId();
  const gradId = `shield-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const redGradId = `shield-red-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Silver gradient for shield outline */}
        <linearGradient id={gradId} x1="12" y1="6" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#E8E8EC" />
          <stop offset="100%" stopColor="#8A8A92" />
        </linearGradient>

        {/* Red accent gradient */}
        <linearGradient id={redGradId} x1="22" y1="20" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF2A2A" />
          <stop offset="100%" stopColor="#8B0000" />
        </linearGradient>

        {variant === 'card' && (
          <filter id={`glow-${gradId}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feFlood floodColor="#E10600" floodOpacity="0.45" result="color" />
            <feComposite in2="blur" in="color" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Outer Shield Outline */}
      <path
        d="M32 6L11 15.2V30.5C11 44.2 20 54.8 32 58C44 54.8 53 44.2 53 30.5V15.2L32 6Z"
        stroke={`url(#${gradId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={variant === 'card' ? 'rgba(225, 6, 0, 0.08)' : 'none'}
        filter={variant === 'card' ? `url(#glow-${gradId})` : undefined}
      />

      {/* Inner Shield Subtle Border Accent */}
      <path
        d="M32 11.5L16 18.5V30.2C16 41 22.8 49.5 32 52.5C41.2 49.5 48 41 48 30.2V18.5L32 11.5Z"
        stroke={`url(#${gradId})`}
        strokeWidth="1.2"
        strokeOpacity="0.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stylized Core - Head / Lock Loop in Silver */}
      <circle
        cx="32"
        cy="24"
        r="5.5"
        fill={`url(#${gradId})`}
      />

      {/* Person Torso / Lock Base */}
      <path
        d="M22 41C22 35.4772 26.4772 32 32 32C37.5228 32 42 35.4772 42 41C42 42.1046 41.1046 43 40 43H24C22.8954 43 22 42.1046 22 41Z"
        fill={`url(#${gradId})`}
      />

      {/* Lock Core Red Accent Keyhole */}
      <ellipse
        cx="32"
        cy="37"
        rx="1.5"
        ry="2.4"
        fill="#FF2A2A"
      />
    </svg>
  );
};
