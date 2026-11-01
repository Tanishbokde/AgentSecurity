import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface SyntheticBadgeProps {
  mode?: string;
  className?: string;
}

export const SyntheticBadge: React.FC<SyntheticBadgeProps> = ({
  mode = 'SYNTHETIC_ONLY',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(225,6,0,0.06)] border border-[#FF2A2A]/40 text-[#E8E8EC] text-xs font-medium select-none shadow-[0_0_12px_rgba(225,6,0,0.15)] ${className}`}
      role="note"
      aria-label="Synthetic security disclaimer"
    >
      <ShieldAlert size={14} className="shrink-0 text-[#FF2A2A]" />
      <span>Synthetic-only prototype security evaluation &mdash; not a security certification</span>
      {mode && (
        <span className="ml-1 px-1.5 py-0.5 rounded bg-[rgba(225,6,0,0.15)] text-[#E8E8EC] border border-[#FF2A2A]/30 text-[10px] font-mono tracking-wider font-semibold uppercase">
          {mode}
        </span>
      )}
    </div>
  );
};

export const SyntheticBanner: React.FC<{ mode?: string }> = ({ mode = 'SYNTHETIC_ONLY' }) => {
  return (
    <div className="w-full bg-[rgba(15,15,18,0.85)] border-b border-[#FF2A2A]/30 py-2 px-4 select-none backdrop-blur-md relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs text-[#E8E8EC]">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-[#FF2A2A] shrink-0" />
          <span className="font-medium tracking-wide">
            Synthetic-only prototype security evaluation &mdash; zero production impact
          </span>
        </div>
        {mode && (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[rgba(225,6,0,0.15)] text-[#E8E8EC] border border-[#FF2A2A]/40 font-semibold tracking-wider">
            MODE: {mode}
          </span>
        )}
      </div>
    </div>
  );
};
