import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Lock, Terminal, Activity } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { Button } from '../components/Button';

export const DashboardPlaceholder: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-[#050506] text-[#E8E8EC] font-sans">
      <BackgroundLayer />
      <Header />

      <main className="flex-1 flex items-center justify-center relative z-10 py-12 px-4">
        <div className="w-full max-w-2xl glass-card border border-[rgba(192,192,192,0.14)] rounded-[24px] sm:rounded-[28px] p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] text-center">
          <div className="inline-flex items-center justify-center p-4 bg-[rgba(225,6,0,0.1)] border border-[#FF2A2A]/30 rounded-2xl mb-6 text-white shadow-[0_0_20px_rgba(225,6,0,0.25)]">
            <ShieldCheck size={48} />
          </div>

          <h1 className="hero-title-silver text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-2 font-display">
            Agent Guard Command Center
          </h1>
          <p className="text-[#8A8A92] text-sm max-w-md mx-auto mb-8 font-sans">
            Session authenticated with quantum-resistant encryption. Your secure workspace is active.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
            <div className="glass-card border border-[rgba(192,192,192,0.12)] p-4">
              <div className="flex items-center gap-2 text-[#FF2A2A] mb-2">
                <Lock size={18} />
                <span className="text-xs font-semibold tracking-wider uppercase text-[#8A8A92] font-display">Security</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">ENCLAVE ENFORCED</p>
              <p className="text-xs text-[#8A8A92] mt-1 font-mono">AES-256 GCM Active</p>
            </div>

            <div className="glass-card border border-[rgba(192,192,192,0.12)] p-4">
              <div className="flex items-center gap-2 text-white mb-2">
                <Activity size={18} />
                <span className="text-xs font-semibold tracking-wider uppercase text-[#8A8A92] font-display">Integrity</span>
              </div>
              <p className="text-sm font-bold text-[#E8E8EC] font-mono">100% VERIFIED</p>
              <p className="text-xs text-[#8A8A92] mt-1 font-mono">0 Anomalies Detected</p>
            </div>

            <div className="glass-card border border-[rgba(192,192,192,0.12)] p-4">
              <div className="flex items-center gap-2 text-[#FF2A2A] mb-2">
                <Terminal size={18} />
                <span className="text-xs font-semibold tracking-wider uppercase text-[#8A8A92] font-display">Daemon</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">NODE #842A</p>
              <p className="text-xs text-[#8A8A92] mt-1 font-mono">Latency &lt; 2ms</p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleSignOut}
            leftIcon={<LogOut size={16} />}
          >
            Sign Out
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};
