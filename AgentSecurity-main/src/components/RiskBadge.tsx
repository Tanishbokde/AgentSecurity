import React from 'react';

interface RiskBadgeProps {
  risk?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk = 'low' }) => {
  const normalized = (risk || 'low').toLowerCase();

  const styles = {
    low: 'bg-[rgba(192,192,192,0.12)] text-[#E8E8EC] border-[rgba(192,192,192,0.3)] shadow-[0_0_10px_rgba(192,192,192,0.1)]',
    medium: 'bg-[rgba(225,6,0,0.08)] text-[#E8E8EC] border-[#FF2A2A]/50 ring-1 ring-[#E10600]/30',
    high: 'bg-[rgba(225,6,0,0.22)] text-[#FF2A2A] border-[#FF2A2A]/60 shadow-[0_0_12px_rgba(225,6,0,0.35)]',
    critical: 'bg-[#8B0000] text-white border-[#FF2A2A] animate-pulse shadow-[0_0_16px_rgba(225,6,0,0.7)]',
  }[normalized] || 'bg-[rgba(192,192,192,0.1)] text-[#8A8A92] border-[rgba(192,192,192,0.18)]';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border ${styles}`}>
      {risk || 'UNKNOWN'}
    </span>
  );
};

export const DecisionBadge: React.FC<{ allowed: boolean }> = ({ allowed }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border ${allowed
          ? 'bg-[rgba(192,192,192,0.14)] text-[#E8E8EC] border-[rgba(192,192,192,0.35)] shadow-[0_0_10px_rgba(192,192,192,0.15)]'
          : 'bg-[rgba(225,6,0,0.22)] text-[#FF2A2A] border-[#FF2A2A]/60 shadow-[0_0_12px_rgba(225,6,0,0.4)]'
        }`}
    >
      {allowed ? 'ALLOWED' : 'BLOCKED'}
    </span>
  );
};

export const ExecutedBadge: React.FC<{ executed: boolean }> = ({ executed }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-medium tracking-wider border ${executed
          ? 'bg-[rgba(192,192,192,0.14)] text-[#E8E8EC] border-[rgba(192,192,192,0.35)]'
          : 'bg-black/50 text-[#8A8A92] border-[rgba(192,192,192,0.12)]'
        }`}
    >
      {executed ? 'EXECUTED' : 'HALTED'}
    </span>
  );
};
