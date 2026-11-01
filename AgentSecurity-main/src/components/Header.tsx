import React from 'react';
import { Link } from 'react-router-dom';
import { AegisShieldLogo } from './AegisShieldLogo';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-[rgba(192,192,192,0.12)] bg-[rgba(11,11,13,0.85)] backdrop-blur-xl z-30 sticky top-0 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A] rounded-lg p-1 -m-1 transition-transform hover:scale-[1.02]"
          aria-label="Agent Guard Home"
        >
          <AegisShieldLogo size={34} variant="header" />
          <div className="flex flex-col select-none leading-none">
            <span className="text-white font-black tracking-widest text-[14px] leading-tight font-display">
              AGENT
            </span>
            <span className="text-[#C0C0C0] font-bold tracking-[0.25em] text-[10px] leading-tight font-display">
              GUARD
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
