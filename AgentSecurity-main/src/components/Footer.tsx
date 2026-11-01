import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[rgba(192,192,192,0.12)] bg-[rgba(11,11,13,0.9)] backdrop-blur-xl py-4 px-4 z-20 mt-auto shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-1.5 text-center select-none">
        <p className="text-[#8A8A92] text-[13px] font-normal leading-normal font-sans">
          &copy; {currentYear} Agent Guard Solutions &mdash; Zero-Trust Autonomous Security Enclave
        </p>
        <div className="flex items-center justify-center space-x-2 text-[13px] text-[#8A8A92]">
          <Link
            to="/privacy"
            className="hover:text-white hover:text-[#E8E8EC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A] rounded px-1.5 py-0.5"
          >
            Privacy Policy
          </Link>
          <span className="text-[#8A8A92]/40" aria-hidden="true">|</span>
          <Link
            to="/terms"
            className="hover:text-white hover:text-[#E8E8EC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A] rounded px-1.5 py-0.5"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};
