import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../lib/api';
import type { GuardianResponse } from '../types/api';
import { AppLayout } from '../components/AppLayout';
import { ErrorCard, LoadingSkeleton } from '../components/DataStates';
import { SafeJsonViewer } from '../components/SafeJsonViewer';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';

export const GuardianPage: React.FC = () => {
  const [guardian, setGuardian] = useState<GuardianResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indicatorSearch, setIndicatorSearch] = useState('');

  const fetchGuardian = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGuardian();
      setGuardian(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load Guardian policy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuardian();
  }, []);

  const policy = guardian?.policy || {};
  const indicators: string[] = Array.isArray((policy as any).indicators)
    ? (policy as any).indicators
    : [];

  const filteredIndicators = indicators.filter((ind) =>
    ind.toLowerCase().includes(indicatorSearch.toLowerCase())
  );

  return (
    <AppLayout executionMode="SYNTHETIC_ONLY">
      <div className="space-y-6 text-left font-sans">
        {/* Title & Refresh */}
        <PageHeader
          title="Guardian Security Policy"
          subtitle="Zero-trust enforcement engine, policy indicators, and runtime allow-list integrity"
          icon={<Shield size={22} />}
          breadcrumbs={[
            { label: 'Security Enclave', to: '/dashboard' },
            { label: 'Guardian' },
          ]}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchGuardian}
              leftIcon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
            >
              Refresh Policy
            </Button>
          }
        />

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-24 skeleton-shimmer rounded-2xl" />
              <div className="h-24 skeleton-shimmer rounded-2xl" />
              <div className="h-24 skeleton-shimmer rounded-2xl" />
            </div>
            <LoadingSkeleton rows={6} />
          </div>
        ) : error ? (
          <ErrorCard message={error} onRetry={fetchGuardian} />
        ) : guardian ? (
          <div className="space-y-6">
            {/* Status & Flags Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
                <div className="flex items-center justify-between text-[#8A8A92] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider font-display">Enforcement Mode</span>
                  <Lock size={16} className="text-[#C0C0C0]" />
                </div>
                <div className="text-sm font-bold font-mono text-white truncate" title={guardian.mode}>
                  {guardian.mode}
                </div>
                <p className="text-[11px] text-[#8A8A92] mt-1 font-mono">
                  Autonomous runtime policy modifier
                </p>
              </div>

              <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
                <div className="flex items-center justify-between text-[#8A8A92] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider font-display">Base Allow-Lists</span>
                  <ShieldCheck size={16} className={guardian.base_allow_lists_unchanged ? 'text-white' : 'text-[#FF2A2A]'} />
                </div>
                <div className={`text-sm font-bold font-mono ${guardian.base_allow_lists_unchanged ? 'text-white' : 'text-[#FF2A2A]'}`}>
                  {guardian.base_allow_lists_unchanged ? 'UNCHANGED (VERIFIED)' : 'ALTERED'}
                </div>
                <p className="text-[11px] text-[#8A8A92] mt-1 font-mono">
                  Core tool permissions remain static
                </p>
              </div>

              <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
                <div className="flex items-center justify-between text-[#8A8A92] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider font-display">Held-out Learning</span>
                  <ShieldAlert size={16} className={guardian.heldout_learning_enabled ? 'text-[#FF2A2A]' : 'text-[#C0C0C0]'} />
                </div>
                <div className={`text-sm font-bold font-mono ${guardian.heldout_learning_enabled ? 'text-[#FF2A2A]' : 'text-[#E8E8EC]'}`}>
                  {guardian.heldout_learning_enabled ? 'ENABLED' : 'DISABLED (ISOLATED)'}
                </div>
                <p className="text-[11px] text-[#8A8A92] mt-1 font-mono">
                  Prevents training set contamination
                </p>
              </div>
            </div>

            {/* Active Policy Generic Key/Value & Indicator Tree */}
            <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[rgba(192,192,192,0.1)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-white" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                    Policy Rules & Indicators Tree
                  </h3>
                </div>

                {indicators.length > 0 && (
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A92]" />
                    <input
                      type="text"
                      placeholder="Filter indicators..."
                      value={indicatorSearch}
                      onChange={(e) => setIndicatorSearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 rounded-lg glass-input text-white text-xs outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Generic Property List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(policy)
                  .filter(([key]) => key !== 'indicators')
                  .map(([key, val]) => (
                    <div key={key} className="p-3.5 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                      <span className="text-[10px] uppercase font-bold text-[#8A8A92] block mb-1 font-display">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Indicators List (if array exists) */}
              {indicators.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-[#8A8A92] mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[#E8E8EC] font-display">
                      Active Deny Indicators ({filteredIndicators.length} of {indicators.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
                    {filteredIndicators.map((ind, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-lg bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)] text-xs font-mono text-[#E8E8EC] flex items-center gap-2 select-text hover:border-[#FF2A2A]/40 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A2A] shadow-[0_0_6px_rgba(255,42,42,0.8)] shrink-0" />
                        <span className="truncate" title={ind}>
                          {ind}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Raw JSON Viewer */}
              <div className="pt-3 border-t border-[rgba(192,192,192,0.1)]">
                <SafeJsonViewer
                  data={guardian}
                  label="Complete Guardian Response JSON"
                  defaultExpanded={false}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};
