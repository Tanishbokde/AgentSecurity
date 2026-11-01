import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { Button } from '../components/Button';

interface LegalPageProps {
  title: string;
  subtitle: string;
}

export const LegalPagePlaceholder: React.FC<LegalPageProps> = ({ title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-[#050506] text-[#E8E8EC] font-sans">
      <BackgroundLayer />
      <Header />

      <main className="flex-1 flex items-center justify-center relative z-10 py-12 px-4">
        <div className="w-full max-w-xl bg-[rgba(15,15,18,0.75)] border border-[rgba(192,192,192,0.14)] rounded-[24px] sm:rounded-[28px] p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl text-left">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 bg-[rgba(225,6,0,0.1)] border border-[#FF2A2A]/30 rounded-xl text-white shadow-[0_0_15px_rgba(225,6,0,0.2)]">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="hero-title-silver text-2xl font-bold uppercase tracking-wider font-display">{title}</h1>
              <p className="text-[#8A8A92] text-xs sm:text-sm mt-0.5">{subtitle}</p>
            </div>
          </div>

          <div className="space-y-4 text-[#8A8A92] text-sm leading-relaxed border-t border-[rgba(192,192,192,0.1)] pt-6 mb-8 font-sans">
            <p>
              Agent Guard Solutions enforces zero-trust architecture, rigorous data isolation, and end-to-end cryptographic confidentiality standards.
            </p>
            <p>
              All synthetic evaluation traces, credentials, and cryptographic tokens are safeguarded via hardware-backed secure enclaves and quantum-resistant key exchange algorithms.
            </p>
            <p className="text-xs text-[#8A8A92]/70 font-mono">
              Last audit: October 2026. For security reports or compliance verification, contact security@agentguard.internal.
            </p>
          </div>

          <Link to="/">
            <Button variant="secondary" size="md" leftIcon={<ArrowLeft size={16} />}>
              Back to Sign In
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};
