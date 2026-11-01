import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { AegisShieldLogo } from '../components/AegisShieldLogo';
import { Button } from '../components/Button';

export const ForgotPasswordPlaceholder: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-[#050506] text-[#E8E8EC] font-sans">
      <BackgroundLayer />
      <Header />

      <main className="flex-1 flex items-center justify-center relative z-10 py-10 sm:py-14 px-4 w-full">
        <div className="w-full max-w-[436px] bg-[rgba(15,15,18,0.75)] border border-[rgba(192,192,192,0.14)] rounded-[24px] sm:rounded-[28px] p-7 sm:p-9 text-center shadow-[0_8px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="mb-4">
              <AegisShieldLogo size={52} variant="card" />
            </div>
            <h1 className="hero-title-silver text-[22px] font-bold uppercase tracking-wider font-display mb-1.5">
              Password Recovery
            </h1>
            <p className="text-[#8A8A92] text-[13px] leading-relaxed">
              {submitted
                ? 'Check your inbox for cryptographic recovery instructions.'
                : 'Enter your registered email to receive an enclave recovery link.'}
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[rgba(192,192,192,0.1)] border border-[rgba(192,192,192,0.25)] text-[#E8E8EC] text-sm flex items-center gap-3 text-left">
                <CheckCircle2 size={24} className="shrink-0 text-white" />
                <span>
                  Recovery instructions dispatched to <strong className="text-white font-mono">{email}</strong>. Please check your inbox within 2 minutes.
                </span>
              </div>

              <Link
                to="/"
                className="w-full inline-block"
              >
                <Button variant="primary" size="lg" className="w-full" leftIcon={<ArrowLeft size={16} />}>
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left space-y-1.5">
                <label htmlFor="recovery-email" className="text-[#E8E8EC] text-[13px] font-semibold tracking-wider uppercase font-sans">
                  Email Address
                </label>
                <div className="relative flex items-center w-full h-[44px] rounded-[10px] glass-input transition-all">
                  <div className="absolute left-3.5 text-[#8A8A92] pointer-events-none">
                    <Mail size={18} />
                  </div>
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-full pl-11 pr-4 bg-transparent text-[#E8E8EC] placeholder-[#8A8A92]/60 text-sm rounded-[10px] outline-none custom-caret"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Send Recovery Link
                </Button>
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-[#8A8A92] hover:text-[#E8E8EC] text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A] rounded px-2 py-1"
                >
                  <ArrowLeft size={15} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
