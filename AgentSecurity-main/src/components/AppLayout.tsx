import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Swords,
  Layers,
  Terminal,
  Trophy,
  History,
  LogOut,
  User as UserIcon,
  Menu,
  X,
} from 'lucide-react';
import { AegisShieldLogo } from './AegisShieldLogo';
import { HealthBadge } from './HealthBadge';
import { SyntheticBanner } from './SyntheticBadge';
import { Footer } from './Footer';
import { BackgroundLayer } from './BackgroundLayer';
import { useAuth } from '../context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
  executionMode?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, executionMode = 'SYNTHETIC_ONLY' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/runs', label: 'Runs', icon: History },
    { to: '/evaluations', label: 'Evaluations', icon: Layers },
    { to: '/arena', label: 'Arena', icon: Swords },
    { to: '/campaign', label: 'Autonomy', icon: Terminal },
    { to: '/guardian', label: 'Guardian', icon: Shield },
    { to: '/benchmarks', label: 'Benchmarks', icon: Trophy },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050506] text-[#E8E8EC] selection:bg-[#E10600] selection:text-white relative font-sans">
      <BackgroundLayer />

      {/* Synthetic Security Prototype Disclaimer Banner */}
      <SyntheticBanner mode={executionMode} />

      {/* Main Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-[rgba(192,192,192,0.12)] bg-[rgba(11,11,13,0.85)] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A] rounded-lg p-1 -m-1 transition-transform hover:scale-[1.02]"
              aria-label="Agent Guard Command Center"
            >
              <AegisShieldLogo size={34} variant="header" />
              <div className="flex flex-col select-none leading-none">
                <span className="text-white font-black tracking-widest text-[14px] leading-tight font-display">
                  AGENT
                </span>
                <span className="text-[#C0C0C0] font-bold tracking-[0.24em] text-[10px] leading-tight font-display">
                  GUARD
                </span>
              </div>
            </Link>

            <div className="hidden md:block">
              <HealthBadge />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF2A2A] to-[#8B0000] text-white border border-[#FF2A2A]/50 shadow-[0_0_16px_rgba(225,6,0,0.45)]'
                        : 'text-[#8A8A92] hover:text-[#E8E8EC] hover:bg-white/[0.05] border border-transparent hover:border-[rgba(192,192,192,0.15)]'
                    }`
                  }
                >
                  <Icon size={14} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <HealthBadge />
            </div>

            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(18,18,22,0.7)] border border-[rgba(192,192,192,0.16)] shadow-sm">
                <UserIcon size={14} className="text-[#C0C0C0]" />
                <span className="text-xs font-medium text-[#E8E8EC] truncate max-w-[140px]" title={user.email}>
                  {user.email}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-[rgba(225,6,0,0.18)] text-[#FF2A2A] border border-[#FF2A2A]/40 font-bold">
                  {user.role}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(18,18,22,0.7)] hover:bg-[rgba(139,0,0,0.3)] border border-[rgba(192,192,192,0.16)] hover:border-[#FF2A2A]/40 text-[#8A8A92] hover:text-[#FF2A2A] text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A] shadow-sm"
              title="Sign out of Agent Guard"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>

            {/* Mobile menu hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl bg-[rgba(18,18,22,0.7)] border border-[rgba(192,192,192,0.16)] text-[#8A8A92] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[rgba(192,192,192,0.1)] bg-[rgba(11,11,13,0.95)] backdrop-blur-2xl px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF2A2A] to-[#8B0000] text-white font-bold border border-[#FF2A2A]/50 shadow-[0_0_12px_rgba(225,6,0,0.4)]'
                        : 'text-[#8A8A92] hover:text-white hover:bg-white/[0.05]'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {user && (
              <div className="pt-3 border-t border-[rgba(192,192,192,0.1)] flex items-center justify-between text-xs text-[#8A8A92]">
                <span className="truncate">{user.email}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[#FF2A2A] hover:text-white"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
