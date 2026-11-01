import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Play,
  XCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { api } from '../lib/api';
import type { CampaignResponse, AutonomyHistoryResponse, CampaignRound } from '../types/api';
import { AppLayout } from '../components/AppLayout';
import { ErrorCard, EmptyState, LoadingSkeleton } from '../components/DataStates';
import { SafeJsonViewer } from '../components/SafeJsonViewer';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';

export const CampaignPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'run' | 'history'>('run');

  // Form State
  const [rounds, setRounds] = useState(3);
  const [attacksPerRound, setAttacksPerRound] = useState(6);
  const [includeHeldout, setIncludeHeldout] = useState(true);
  const [includeBenign, setIncludeBenign] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignResult, setCampaignResult] = useState<CampaignResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // History State
  const [history, setHistory] = useState<AutonomyHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await api.getAutonomyHistory(20);
      setHistory(data);
    } catch (err: any) {
      setHistoryError(err.message || 'Failed to fetch autonomy history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await api.runCampaign(
        {
          rounds,
          attacks_per_round: attacksPerRound,
          include_heldout: includeHeldout,
          include_benign: includeBenign,
        },
        controller.signal
      );
      setCampaignResult(data);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.status === 408) {
        setError('Campaign execution was cancelled or timed out.');
      } else {
        setError(err.message || 'Failed to execute autonomous campaign.');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <AppLayout executionMode={campaignResult?.execution_mode || 'SYNTHETIC_ONLY'}>
      <div className="space-y-6 text-left font-sans">
        {/* Header with Tabs */}
        <PageHeader
          title="Autonomous Security Campaign"
          subtitle="Multi-round autonomous adversary campaign with automated policy adaptation and generalization checks"
          icon={<Terminal size={22} />}
          breadcrumbs={[
            { label: 'Security Enclave', to: '/dashboard' },
            { label: 'Autonomy' },
          ]}
          actions={
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[rgba(15,15,18,0.7)] border border-[rgba(192,192,192,0.14)]">
              <button
                type="button"
                onClick={() => setActiveTab('run')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-display transition-all ${
                  activeTab === 'run'
                    ? 'bg-gradient-to-r from-[#FF2A2A] to-[#8B0000] text-white border border-[#FF2A2A]/50 shadow-[0_0_12px_rgba(225,6,0,0.4)]'
                    : 'text-[#8A8A92] hover:text-white'
                }`}
              >
                Run Campaign
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-display transition-all ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-[#FF2A2A] to-[#8B0000] text-white border border-[#FF2A2A]/50 shadow-[0_0_12px_rgba(225,6,0,0.4)]'
                    : 'text-[#8A8A92] hover:text-white'
                }`}
              >
                History
              </button>
            </div>
          }
        />

        {activeTab === 'run' ? (
          <div className="space-y-6">
            {/* Campaign Run Configuration Form */}
            <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
              <form onSubmit={handleRun} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Rounds */}
                  <div className="space-y-1.5">
                    <label htmlFor="camp-rounds" className="text-xs font-semibold uppercase tracking-wider text-[#E8E8EC] font-display">
                      Rounds (1 - 5)
                    </label>
                    <input
                      id="camp-rounds"
                      type="number"
                      min={1}
                      max={5}
                      value={rounds}
                      onChange={(e) => setRounds(Math.min(5, Math.max(1, Number(e.target.value))))}
                      disabled={loading}
                      className="w-full h-10 px-3 rounded-xl glass-input text-white text-sm font-mono custom-caret disabled:opacity-50"
                    />
                    <span className="text-[11px] text-[#8A8A92] block">Default: 3</span>
                  </div>

                  {/* Attacks per round */}
                  <div className="space-y-1.5">
                    <label htmlFor="camp-attacks" className="text-xs font-semibold uppercase tracking-wider text-[#E8E8EC] font-display">
                      Attacks per Round (1 - 8)
                    </label>
                    <input
                      id="camp-attacks"
                      type="number"
                      min={1}
                      max={8}
                      value={attacksPerRound}
                      onChange={(e) => setAttacksPerRound(Math.min(8, Math.max(1, Number(e.target.value))))}
                      disabled={loading}
                      className="w-full h-10 px-3 rounded-xl glass-input text-white text-sm font-mono custom-caret disabled:opacity-50"
                    />
                    <span className="text-[11px] text-[#8A8A92] block">Default: 6</span>
                  </div>

                  {/* Include Heldout Checkbox */}
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer h-10 select-none">
                      <input
                        type="checkbox"
                        checked={includeHeldout}
                        onChange={(e) => setIncludeHeldout(e.target.checked)}
                        disabled={loading}
                        className="w-4 h-4 rounded text-[#FF2A2A] bg-[rgba(15,15,18,0.7)] border-[rgba(192,192,192,0.3)] focus:ring-1 focus:ring-[#FF2A2A]"
                      />
                      <span className="text-xs font-semibold text-[#E8E8EC] font-display uppercase tracking-wider">
                        Include Held-out Set
                      </span>
                    </label>
                    <span className="text-[11px] text-[#8A8A92] block">Generalization tests</span>
                  </div>

                  {/* Include Benign Checkbox */}
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer h-10 select-none">
                      <input
                        type="checkbox"
                        checked={includeBenign}
                        onChange={(e) => setIncludeBenign(e.target.checked)}
                        disabled={loading}
                        className="w-4 h-4 rounded text-[#FF2A2A] bg-[rgba(15,15,18,0.7)] border-[rgba(192,192,192,0.3)] focus:ring-1 focus:ring-[#FF2A2A]"
                      />
                      <span className="text-xs font-semibold text-[#E8E8EC] font-display uppercase tracking-wider">
                        Include Benign Tasks
                      </span>
                    </label>
                    <span className="text-[11px] text-[#8A8A92] block">Usefulness verification</span>
                  </div>
                </div>

                {loading && (
                  <div className="p-4 rounded-xl bg-[rgba(225,6,0,0.1)] border border-[#FF2A2A]/40 flex items-center justify-between gap-3 text-xs text-[#E8E8EC] shadow-[0_0_15px_rgba(225,6,0,0.2)]">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-[#FF2A2A] animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>
                        Simulating autonomous campaign across {rounds} rounds... This operation can take up to 60-120 seconds.
                      </span>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleCancel}
                      leftIcon={<XCircle size={13} />}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {error && (
                  <ErrorCard
                    title="Campaign Run Error"
                    message={error}
                    onRetry={() => handleRun({ preventDefault: () => {} } as any)}
                  />
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={loading}
                    isLoading={loading}
                    leftIcon={<Play size={14} />}
                  >
                    {loading ? 'Executing Campaign...' : 'Launch Autonomous Campaign'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Prominent Campaign Notes Display */}
            {campaignResult?.notes && campaignResult.notes.length > 0 && (
              <div className="p-4 rounded-xl glass-card border border-[rgba(225,6,0,0.3)] space-y-1.5 shadow-[0_0_15px_rgba(225,6,0,0.15)]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF2A2A] font-display">
                  <Info size={15} />
                  <span>Autonomous Campaign Observations & Advisory</span>
                </div>
                <ul className="list-disc list-inside text-xs text-[#E8E8EC] space-y-1 font-sans">
                  {campaignResult.notes.map((note, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rounds Telemetry & Metric Cards */}
            {campaignResult && campaignResult.rounds && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(192,192,192,0.1)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-white" />
                    <h2 className="text-base font-bold uppercase tracking-wider text-white font-display">
                      Campaign Outcome: {campaignResult.status} ({campaignResult.rounds.length} Rounds)
                    </h2>
                  </div>
                </div>

                {campaignResult.rounds.map((round: CampaignRound, rIdx: number) => {
                  const s = round.summary || {};
                  const roundNum = s.round ?? (rIdx + 1);

                  return (
                    <div
                      key={round.id || rIdx}
                      className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-[rgba(192,192,192,0.08)]">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-[rgba(225,6,0,0.18)] text-white font-mono text-xs font-bold border border-[#FF2A2A]/40 shadow-[0_0_10px_rgba(225,6,0,0.25)]">
                            CAMPAIGN ROUND #{roundNum}
                          </span>
                          <span className="text-xs text-[#8A8A92] font-mono">
                            {s.cases ?? 0} Evaluated Cases
                          </span>
                        </div>
                        {s.guardian_version !== undefined && (
                          <span className="font-mono text-xs text-white bg-[rgba(15,15,18,0.7)] px-2.5 py-1 rounded-lg border border-[rgba(192,192,192,0.2)]">
                            Guardian Version: v{String(s.guardian_version)}
                          </span>
                        )}
                      </div>

                      {/* Per-round 7 Core Metric Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
                        <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                          <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
                            Attack Success
                          </span>
                          <span className="text-base font-bold font-display text-[#FF2A2A] tabular-nums">
                            {s.attack_success_rate !== undefined
                              ? `${(Number(s.attack_success_rate) * 100).toFixed(0)}%`
                              : '-'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                          <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
                            Heldout Block
                          </span>
                          <span className="text-base font-bold font-display text-white tabular-nums">
                            {s.heldout_block_rate !== undefined
                              ? `${(Number(s.heldout_block_rate) * 100).toFixed(0)}%`
                              : '-'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                          <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
                            Usefulness
                          </span>
                          <span className="text-base font-bold font-display text-[#E8E8EC] tabular-nums">
                            {s.usefulness_rate !== undefined
                              ? `${(Number(s.usefulness_rate) * 100).toFixed(0)}%`
                              : '-'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                          <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
                            Protected Reads
                          </span>
                          <span className="text-base font-bold font-display text-white tabular-nums">
                            {s.protected_reads ?? 0}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                          <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
                            Canary Hits
                          </span>
                          <span className="text-base font-bold font-display text-[#FF2A2A] tabular-nums">
                            {s.canary_hits ?? 0}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                          <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
                            Unauthorized
                          </span>
                          <span className={`text-base font-bold font-display tabular-nums ${s.unauthorized_effects ? 'text-[#FF2A2A]' : 'text-[#E8E8EC]'}`}>
                            {s.unauthorized_effects ?? 0}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)] col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
                            Mode
                          </span>
                          <span className="text-xs font-bold font-mono text-[#E8E8EC]">
                            {s.execution_mode || 'SYNTHETIC'}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Case List */}
                      {round.cases && round.cases.length > 0 && (
                        <div className="pt-2">
                          <SafeJsonViewer
                            data={round.cases}
                            label={`Recorded Case Traces (${round.cases.length})`}
                            defaultExpanded={false}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* History Tab */
          <div className="space-y-4">
            {historyLoading ? (
              <LoadingSkeleton rows={6} />
            ) : historyError ? (
              <ErrorCard message={historyError} onRetry={fetchHistory} />
            ) : !history || history.items.length === 0 ? (
              <EmptyState
                title="No Campaign History"
                description="Launch an autonomous campaign to generate telemetry and audit logs."
                actionText="Launch Campaign"
                onAction={() => setActiveTab('run')}
              />
            ) : (
              <div className="space-y-4">
                {history.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-[#8A8A92] pb-2 border-b border-[rgba(192,192,192,0.08)]">
                      <span className="font-mono text-white font-bold">
                        Campaign: {item.id}
                      </span>
                      <span className="font-mono">{new Date(item.created_at).toLocaleString()}</span>
                    </div>

                    {item.rounds && (
                      <SafeJsonViewer
                        data={item.rounds}
                        label={`Campaign Rounds (${item.rounds.length})`}
                        defaultExpanded={false}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
