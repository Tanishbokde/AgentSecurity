import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Play,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { api } from '../lib/api';
import type { BenchmarkResponse, ScoreboardResponse, ScoreboardItem } from '../types/api';
import { AppLayout } from '../components/AppLayout';
import { ErrorCard, EmptyState, LoadingSkeleton } from '../components/DataStates';
import { SafeJsonViewer } from '../components/SafeJsonViewer';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';

export const BenchmarksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'run' | 'scoreboard'>('scoreboard');

  // Benchmark Run Form State
  const [rounds, setRounds] = useState(3);
  const [attacksPerRound, setAttacksPerRound] = useState(6);
  const [includeHeldout, setIncludeHeldout] = useState(true);
  const [includeBenign, setIncludeBenign] = useState(true);

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<BenchmarkResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scoreboard State
  const [scoreboard, setScoreboard] = useState<ScoreboardResponse | null>(null);
  const [scoreboardLoading, setScoreboardLoading] = useState(true);
  const [scoreboardError, setScoreboardError] = useState<string | null>(null);

  const fetchScoreboard = async () => {
    setScoreboardLoading(true);
    setScoreboardError(null);
    try {
      const data = await api.getBenchmarkScoreboard(50);
      setScoreboard(data);
    } catch (err: any) {
      setScoreboardError(err.message || 'Failed to load benchmark scoreboard.');
    } finally {
      setScoreboardLoading(false);
    }
  };

  useEffect(() => {
    fetchScoreboard();
  }, []);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunError(null);
    setRunning(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await api.runBenchmark(
        {
          rounds,
          attacks_per_round: attacksPerRound,
          include_heldout: includeHeldout,
          include_benign: includeBenign,
        },
        controller.signal
      );
      setRunResult(data);
      // Refresh scoreboard after run completes
      fetchScoreboard();
    } catch (err: any) {
      if (err.name === 'AbortError' || err.status === 408) {
        setRunError('Benchmark execution was cancelled or timed out.');
      } else {
        setRunError(err.message || 'Failed to execute benchmark run.');
      }
    } finally {
      setRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const items = scoreboard?.items || [];

  return (
    <AppLayout executionMode={scoreboard?.execution_mode || runResult?.execution_mode || 'SYNTHETIC_ONLY'}>
      <div className="space-y-6 text-left font-sans">
        {/* Header with Tab Buttons */}
        <PageHeader
          title="Benchmark Suite & Scoreboard"
          subtitle="Standardized security benchmarks and historical score evaluations"
          icon={<Trophy size={22} />}
          breadcrumbs={[
            { label: 'Security Enclave', to: '/dashboard' },
            { label: 'Benchmarks' },
          ]}
          actions={
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[rgba(15,15,18,0.7)] border border-[rgba(192,192,192,0.14)]">
              <button
                type="button"
                onClick={() => setActiveTab('scoreboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-display transition-all ${
                  activeTab === 'scoreboard'
                    ? 'bg-gradient-to-r from-[#FF2A2A] to-[#8B0000] text-white border border-[#FF2A2A]/50 shadow-[0_0_12px_rgba(225,6,0,0.4)]'
                    : 'text-[#8A8A92] hover:text-white'
                }`}
              >
                Your Results
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('run')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-display transition-all ${
                  activeTab === 'run'
                    ? 'bg-gradient-to-r from-[#FF2A2A] to-[#8B0000] text-white border border-[#FF2A2A]/50 shadow-[0_0_12px_rgba(225,6,0,0.4)]'
                    : 'text-[#8A8A92] hover:text-white'
                }`}
              >
                Run Benchmark
              </button>
            </div>
          }
        />

        {/* Prominent Disclaimer */}
        {(runResult?.disclaimer || scoreboard) && (
          <div className="p-4 rounded-xl glass-card border border-[#FF2A2A]/30 bg-[rgba(225,6,0,0.06)] flex items-start gap-3 text-xs text-[#E8E8EC] shadow-[0_0_15px_rgba(225,6,0,0.15)]">
            <AlertTriangle size={18} className="text-[#FF2A2A] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold uppercase tracking-wider block mb-0.5 text-white font-display">
                Benchmark Disclaimer & Scope
              </span>
              <p className="text-[#8A8A92]">
                {runResult?.disclaimer ||
                  'Scoreboard displays evaluations scoped to your authenticated account only. This constitutes a synthetic prototype security assessment and does not guarantee complete adversarial immunity in production environments.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'scoreboard' ? (
          <div className="space-y-6">
            {/* Scoreboard Trend Chart */}
            {items.length > 0 && (
              <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(192,192,192,0.08)]">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#FF2A2A]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-display">
                      Historical Performance Trends (Your Results &mdash; {items.length} records)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#8A8A92]">
                    Scope: {scoreboard?.scope || 'current_user_only'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Metric 1: Held-out Block Rate Trend */}
                  <div className="p-4 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)] space-y-2">
                    <span className="text-xs font-semibold text-[#E8E8EC] block font-display uppercase tracking-wider">
                      Heldout Block Rate Trend
                    </span>
                    <div className="flex items-end gap-1.5 h-24 pt-2 border-b border-[rgba(192,192,192,0.1)]">
                      {items.slice(0, 10).reverse().map((item, idx) => {
                        const val = Number(item.summary?.heldout_block_rate ?? item.summary?.action_block_rate ?? 0);
                        const pct = Math.max(Math.round(val * 100), 10);
                        return (
                          <div key={item.id || idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              style={{ height: `${pct}%` }}
                              className="w-full rounded-t bg-gradient-to-t from-[#8B0000] via-[#E10600] to-[#FF2A2A] group-hover:from-[#E10600] group-hover:to-[#FF2A2A] shadow-[0_0_8px_rgba(225,6,0,0.3)] transition-all"
                              title={`#${idx + 1}: ${(val * 100).toFixed(1)}%`}
                            />
                            <span className="text-[9px] font-mono text-[#8A8A92]">#{idx + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Metric 2: Usefulness Rate Trend */}
                  <div className="p-4 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)] space-y-2">
                    <span className="text-xs font-semibold text-[#E8E8EC] block font-display uppercase tracking-wider">
                      Benign Usefulness Rate
                    </span>
                    <div className="flex items-end gap-1.5 h-24 pt-2 border-b border-[rgba(192,192,192,0.1)]">
                      {items.slice(0, 10).reverse().map((item, idx) => {
                        const val = Number(item.summary?.usefulness_rate ?? item.summary?.legitimate_task_success_rate ?? 0);
                        const pct = Math.max(Math.round(val * 100), 10);
                        return (
                          <div key={item.id || idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              style={{ height: `${pct}%` }}
                              className="w-full rounded-t bg-gradient-to-t from-[#8A8A92] to-[#E8E8EC] group-hover:from-[#C0C0C0] group-hover:to-white shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all"
                              title={`#${idx + 1}: ${(val * 100).toFixed(1)}%`}
                            />
                            <span className="text-[9px] font-mono text-[#8A8A92]">#{idx + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Metric 3: Attack Success Rate (lower is better) */}
                  <div className="p-4 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)] space-y-2">
                    <span className="text-xs font-semibold text-[#E8E8EC] block font-display uppercase tracking-wider">
                      Adversary Success Rate
                    </span>
                    <div className="flex items-end gap-1.5 h-24 pt-2 border-b border-[rgba(192,192,192,0.1)]">
                      {items.slice(0, 10).reverse().map((item, idx) => {
                        const val = Number(item.summary?.attack_success_rate ?? 0);
                        const pct = Math.max(Math.round(val * 100), 10);
                        return (
                          <div key={item.id || idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              style={{ height: `${pct}%` }}
                              className="w-full rounded-t bg-[#8B0000] group-hover:bg-[#FF2A2A] transition-colors shadow-[0_0_8px_rgba(139,0,0,0.5)]"
                              title={`#${idx + 1}: ${(val * 100).toFixed(1)}%`}
                            />
                            <span className="text-[9px] font-mono text-[#8A8A92]">#{idx + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scoreboard Items Table */}
            <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(192,192,192,0.08)] mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8E8EC] font-display">
                  Your Results Scoreboard Table ({items.length} sessions)
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchScoreboard}
                  leftIcon={<RefreshCw size={12} className={scoreboardLoading ? 'animate-spin' : ''} />}
                >
                  Refresh
                </Button>
              </div>

              {scoreboardLoading ? (
                <LoadingSkeleton rows={5} />
              ) : scoreboardError ? (
                <ErrorCard message={scoreboardError} onRetry={fetchScoreboard} />
              ) : items.length === 0 ? (
                <EmptyState
                  title="No Benchmark Results Yet"
                  description="Run a benchmark test to generate score entries and track policy efficacy."
                  actionText="Launch Benchmark"
                  onAction={() => setActiveTab('run')}
                />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[rgba(192,192,192,0.1)]">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] uppercase tracking-wider text-[#8A8A92] border-b border-[rgba(192,192,192,0.12)] bg-[rgba(11,11,13,0.9)] sticky top-0 font-display">
                      <tr>
                        <th className="py-3 px-3.5">Session ID</th>
                        <th className="py-3 px-3.5">Summary Metrics</th>
                        <th className="py-3 px-3.5">Timestamp</th>
                        <th className="py-3 px-3.5 text-right">Replay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(192,192,192,0.06)] bg-[rgba(15,15,18,0.5)]">
                      {items.map((item: ScoreboardItem, idx: number) => (
                        <tr
                          key={item.id || idx}
                          className={`transition-colors hover:bg-[rgba(225,6,0,0.06)] ${
                            idx % 2 === 1 ? 'bg-white/[0.02]' : ''
                          }`}
                        >
                          <td className="py-3 px-3.5 font-mono font-medium text-white">
                            {item.id}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.summary || {})
                                .filter(([, val]) => typeof val === 'number')
                                .slice(0, 4)
                                .map(([k, v]) => (
                                  <span
                                    key={k}
                                    className="px-2 py-0.5 rounded bg-[rgba(15,15,18,0.7)] border border-[rgba(192,192,192,0.12)] text-[10px] font-mono text-[#E8E8EC]"
                                  >
                                    {k}: {typeof v === 'number' && v <= 1 && v > 0 ? `${(v * 100).toFixed(0)}%` : String(v)}
                                  </span>
                                ))}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-[#8A8A92] text-[11px] whitespace-nowrap font-mono">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <Link
                              to={`/replay/${item.id}`}
                              className="inline-flex items-center gap-1 text-[#C0C0C0] hover:text-[#FF2A2A] font-semibold text-xs transition-colors"
                            >
                              <span>Replay</span>
                              <ExternalLink size={12} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Run Benchmark Form */
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
              <form onSubmit={handleRun} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="bm-rounds" className="text-xs font-semibold uppercase tracking-wider text-[#E8E8EC] font-display">
                      Rounds (1 - 5)
                    </label>
                    <input
                      id="bm-rounds"
                      type="number"
                      min={1}
                      max={5}
                      value={rounds}
                      onChange={(e) => setRounds(Math.min(5, Math.max(1, Number(e.target.value))))}
                      disabled={running}
                      className="w-full h-10 px-3 rounded-xl glass-input text-white text-sm font-mono custom-caret disabled:opacity-50"
                    />
                    <span className="text-[11px] text-[#8A8A92] block">Default: 3</span>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="bm-attacks" className="text-xs font-semibold uppercase tracking-wider text-[#E8E8EC] font-display">
                      Attacks per Round (1 - 8)
                    </label>
                    <input
                      id="bm-attacks"
                      type="number"
                      min={1}
                      max={8}
                      value={attacksPerRound}
                      onChange={(e) => setAttacksPerRound(Math.min(8, Math.max(1, Number(e.target.value))))}
                      disabled={running}
                      className="w-full h-10 px-3 rounded-xl glass-input text-white text-sm font-mono custom-caret disabled:opacity-50"
                    />
                    <span className="text-[11px] text-[#8A8A92] block">Default: 6</span>
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer h-10 select-none">
                      <input
                        type="checkbox"
                        checked={includeHeldout}
                        onChange={(e) => setIncludeHeldout(e.target.checked)}
                        disabled={running}
                        className="w-4 h-4 rounded text-[#FF2A2A] bg-[rgba(15,15,18,0.7)] border-[rgba(192,192,192,0.3)] focus:ring-1 focus:ring-[#FF2A2A]"
                      />
                      <span className="text-xs font-semibold text-[#E8E8EC] font-display uppercase tracking-wider">
                        Include Held-out Dataset
                      </span>
                    </label>
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer h-10 select-none">
                      <input
                        type="checkbox"
                        checked={includeBenign}
                        onChange={(e) => setIncludeBenign(e.target.checked)}
                        disabled={running}
                        className="w-4 h-4 rounded text-[#FF2A2A] bg-[rgba(15,15,18,0.7)] border-[rgba(192,192,192,0.3)] focus:ring-1 focus:ring-[#FF2A2A]"
                      />
                      <span className="text-xs font-semibold text-[#E8E8EC] font-display uppercase tracking-wider">
                        Include Benign Tasks
                      </span>
                    </label>
                  </div>
                </div>

                {running && (
                  <div className="p-4 rounded-xl bg-[rgba(225,6,0,0.1)] border border-[#FF2A2A]/40 flex items-center justify-between gap-3 text-xs text-[#E8E8EC] shadow-[0_0_15px_rgba(225,6,0,0.2)]">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-[#FF2A2A] animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>
                        Simulating standardized benchmark evaluation... This operation may take 60-120 seconds.
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

                {runError && (
                  <ErrorCard
                    title="Benchmark Run Error"
                    message={runError}
                    onRetry={() => handleRun({ preventDefault: () => {} } as any)}
                  />
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={running}
                    isLoading={running}
                    leftIcon={<Play size={14} />}
                  >
                    {running ? 'Running Benchmark...' : 'Execute Benchmark Suite'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Run Results */}
            {runResult && (
              <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(192,192,192,0.08)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-white" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                      Benchmark Complete: {runResult.status}
                    </h3>
                  </div>
                </div>

                <SafeJsonViewer
                  data={runResult}
                  label="Complete Benchmark Telemetry Result"
                  defaultExpanded={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
