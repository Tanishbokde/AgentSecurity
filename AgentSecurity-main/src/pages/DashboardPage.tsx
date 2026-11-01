import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Swords,
  Terminal,
  Trophy,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Activity,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Run, GuardianResponse, ScoreboardResponse } from '../types/api';
import { AppLayout } from '../components/AppLayout';
import { DecisionBadge } from '../components/RiskBadge';
import { ErrorCard, EmptyState, CardSkeleton } from '../components/DataStates';
import { SafeJsonViewer } from '../components/SafeJsonViewer';
import { PageHeader } from '../components/PageHeader';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { Button } from '../components/Button';

export const DashboardPage: React.FC = () => {
  // Widget 1: Runs & KPIs
  const [runs, setRuns] = useState<Run[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [runsError, setRunsError] = useState<string | null>(null);

  // Widget 2: Guardian
  const [guardian, setGuardian] = useState<GuardianResponse | null>(null);
  const [guardianLoading, setGuardianLoading] = useState(true);
  const [guardianError, setGuardianError] = useState<string | null>(null);

  // Widget 3: Scoreboard
  const [scoreboard, setScoreboard] = useState<ScoreboardResponse | null>(null);
  const [scoreboardLoading, setScoreboardLoading] = useState(true);
  const [scoreboardError, setScoreboardError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    setRunsLoading(true);
    setRunsError(null);
    try {
      const data = await api.getRuns(10);
      setRuns(data.items || []);
    } catch (err: any) {
      setRunsError(err.message || 'Failed to fetch runs telemetry');
    } finally {
      setRunsLoading(false);
    }
  }, []);

  const fetchGuardian = useCallback(async () => {
    setGuardianLoading(true);
    setGuardianError(null);
    try {
      const data = await api.getGuardian();
      setGuardian(data);
    } catch (err: any) {
      setGuardianError(err.message || 'Failed to fetch guardian policy');
    } finally {
      setGuardianLoading(false);
    }
  }, []);

  const fetchScoreboard = useCallback(async () => {
    setScoreboardLoading(true);
    setScoreboardError(null);
    try {
      const data = await api.getBenchmarkScoreboard(10);
      setScoreboard(data);
    } catch (err: any) {
      setScoreboardError(err.message || 'Failed to fetch scoreboard data');
    } finally {
      setScoreboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRuns();
    fetchGuardian();
    fetchScoreboard();
  }, [fetchRuns, fetchGuardian, fetchScoreboard]);

  // Aggregate KPI metrics from real live runs
  const totalRecentRuns = runs.length;
  let totalBlocked = 0;
  let totalExecuted = 0;
  let totalProposed = 0;
  let totalUnauthorized = 0;

  runs.forEach((r) => {
    if (r.metrics) {
      totalBlocked += Number(r.metrics.blocked_actions || 0);
      totalExecuted += Number(r.metrics.executed_actions || 0);
      totalProposed += Number(r.metrics.proposed_actions || 0);
      totalUnauthorized += Number(r.metrics.unauthorized_executions || 0);
    }
  });

  const aggregateBlockRateNumber =
    totalProposed > 0 ? (totalBlocked / totalProposed) * 100 : 0;
  const aggregateBlockRate = aggregateBlockRateNumber.toFixed(1);

  const latestScoreboardItem = scoreboard?.items?.[0];
  const latestSummary = latestScoreboardItem?.summary || {};

  return (
    <AppLayout executionMode="SYNTHETIC_ONLY">
      <div className="space-y-6 text-left font-sans">
        {/* Top Header / Actions Bar */}
        <PageHeader
          title="Security Operations Dashboard"
          subtitle="Live telemetry and synthetic evaluation enclave overview"
          breadcrumbs={[
            { label: 'Security Enclave', to: '/dashboard' },
            { label: 'Dashboard' },
          ]}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                fetchRuns();
                fetchGuardian();
                fetchScoreboard();
              }}
              leftIcon={
                <RefreshCw
                  size={13}
                  className={runsLoading || guardianLoading || scoreboardLoading ? 'animate-spin' : ''}
                />
              }
            >
              Refresh
            </Button>
          }
        />

        {/* Quick-action buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/evaluations"
            className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-[rgba(192,192,192,0.12)] hover:border-[#E10600]/50 hover:shadow-[0_0_20px_rgba(225,6,0,0.25)] transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-[rgba(225,6,0,0.1)] border border-[#FF2A2A]/30 text-[#FF2A2A] group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(225,6,0,0.2)]">
              <Layers size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#E8E8EC] uppercase tracking-wider font-display">Evaluation</div>
              <div className="text-[11px] text-[#8A8A92]">Run safe vs red-team</div>
            </div>
          </Link>

          <Link
            to="/arena"
            className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-[rgba(192,192,192,0.12)] hover:border-[#E10600]/50 hover:shadow-[0_0_20px_rgba(225,6,0,0.25)] transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-[rgba(225,6,0,0.1)] border border-[#FF2A2A]/30 text-[#FF2A2A] group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(225,6,0,0.2)]">
              <Swords size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#E8E8EC] uppercase tracking-wider font-display">Arena</div>
              <div className="text-[11px] text-[#8A8A92]">Multi-family attack rounds</div>
            </div>
          </Link>

          <Link
            to="/campaign"
            className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-[rgba(192,192,192,0.12)] hover:border-[#E10600]/50 hover:shadow-[0_0_20px_rgba(225,6,0,0.25)] transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-[rgba(225,6,0,0.1)] border border-[#FF2A2A]/30 text-[#FF2A2A] group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(225,6,0,0.2)]">
              <Terminal size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#E8E8EC] uppercase tracking-wider font-display">Autonomy</div>
              <div className="text-[11px] text-[#8A8A92]">Autonomous campaign</div>
            </div>
          </Link>

          <Link
            to="/benchmarks"
            className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-[rgba(192,192,192,0.12)] hover:border-[#E10600]/50 hover:shadow-[0_0_20px_rgba(225,6,0,0.25)] transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-[rgba(225,6,0,0.1)] border border-[#FF2A2A]/30 text-[#FF2A2A] group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(225,6,0,0.2)]">
              <Trophy size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#E8E8EC] uppercase tracking-wider font-display">Benchmark</div>
              <div className="text-[11px] text-[#8A8A92]">Scoreboard & metrics</div>
            </div>
          </Link>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Recent Runs */}
          <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
            <div className="flex items-center justify-between text-[#8A8A92] mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase font-display flex items-center">
                <span className="w-2 h-2 rounded-full bg-[#FF2A2A] animate-pulse shadow-[0_0_8px_rgba(255,42,42,0.8)] mr-1.5 inline-block" />
                Recent Runs
              </span>
              <Activity size={16} className="text-[#C0C0C0]" />
            </div>
            {runsLoading ? (
              <div className="h-8 skeleton-shimmer rounded w-1/2 my-1" />
            ) : (
              <div className="text-3xl font-bold font-display text-white tabular-nums tracking-tight">
                <AnimatedCounter value={totalRecentRuns} />
              </div>
            )}
            <div className="text-[11px] text-[#8A8A92] mt-1 font-mono">
              Sampled from last {runs.length} logged runs
            </div>
          </div>

          {/* Card 2: Blocked Actions */}
          <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
            <div className="flex items-center justify-between text-[#8A8A92] mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase font-display">Blocked vs Executed</span>
              <ShieldCheck size={16} className="text-[#C0C0C0]" />
            </div>
            {runsLoading ? (
              <div className="h-8 skeleton-shimmer rounded w-1/2 my-1" />
            ) : (
              <div className="text-3xl font-bold font-display text-white tabular-nums tracking-tight flex items-baseline">
                <span className="text-[#FF2A2A] drop-shadow-[0_0_10px_rgba(225,6,0,0.5)]">
                  <AnimatedCounter value={totalBlocked} />
                </span>
                <span className="text-[#8A8A92] text-lg mx-2">/</span>
                <span className="text-[#E8E8EC]">
                  <AnimatedCounter value={totalExecuted} />
                </span>
              </div>
            )}
            <div className="text-[11px] text-[#8A8A92] mt-1 font-mono">
              {totalProposed} total proposed tool actions
            </div>
          </div>

          {/* Card 3: Action Block Rate */}
          <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
            <div className="flex items-center justify-between text-[#8A8A92] mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase font-display">Action Block Rate</span>
              <Lock size={16} className="text-[#FF2A2A]" />
            </div>
            {runsLoading ? (
              <div className="h-8 skeleton-shimmer rounded w-1/2 my-1" />
            ) : (
              <div>
                <div className="text-3xl font-bold font-display text-[#FF2A2A] tabular-nums tracking-tight drop-shadow-[0_0_12px_rgba(225,6,0,0.4)]">
                  <AnimatedCounter value={aggregateBlockRate} suffix="%" />
                </div>
                {/* Progress bar with red gradient fill */}
                <div className="w-full h-1.5 bg-[#050506] rounded-full overflow-hidden mt-2 border border-white/[0.06]">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B0000] via-[#E10600] to-[#FF2A2A] rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(225,6,0,0.6)]"
                    style={{ width: `${Math.min(100, aggregateBlockRateNumber)}%` }}
                  />
                </div>
              </div>
            )}
            <div className="text-[11px] text-[#8A8A92] mt-1 font-mono">
              Guardian zero-trust enforcement
            </div>
          </div>

          {/* Card 4: Unauthorized Executions */}
          <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
            <div className="flex items-center justify-between text-[#8A8A92] mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase font-display">Unauthorized Effects</span>
              <ShieldAlert size={16} className={totalUnauthorized > 0 ? 'text-[#FF2A2A]' : 'text-[#C0C0C0]'} />
            </div>
            {runsLoading ? (
              <div className="h-8 skeleton-shimmer rounded w-1/2 my-1" />
            ) : (
              <div className={`text-3xl font-bold font-display tabular-nums tracking-tight ${totalUnauthorized > 0 ? 'text-[#FF2A2A] drop-shadow-[0_0_12px_rgba(225,6,0,0.6)]' : 'text-[#E8E8EC]'}`}>
                <AnimatedCounter value={totalUnauthorized} />
              </div>
            )}
            <div className="text-[11px] text-[#8A8A92] mt-1 font-mono">
              Zero tolerance enclave policy
            </div>
          </div>
        </div>

        {/* Middle Section: Guardian Status & Benchmark Scoreboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Guardian Policy Card */}
          <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(192,192,192,0.1)] mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#FF2A2A]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                    Guardian Status & Enclave Policy
                  </h3>
                </div>
                <Link
                  to="/guardian"
                  className="text-xs text-[#C0C0C0] hover:text-[#FF2A2A] inline-flex items-center gap-1 font-medium transition-colors"
                >
                  <span>View Policy</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              {guardianLoading ? (
                <CardSkeleton />
              ) : guardianError ? (
                <ErrorCard message={guardianError} onRetry={fetchGuardian} />
              ) : guardian ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                      <span className="text-[#8A8A92] block mb-0.5 text-[11px] uppercase tracking-wider font-display">Enforcement Mode</span>
                      <span className="font-mono text-[#E8E8EC] font-semibold text-[11px] truncate block" title={guardian.mode}>
                        {guardian.mode}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                      <span className="text-[#8A8A92] block mb-0.5 text-[11px] uppercase tracking-wider font-display">Policy Version</span>
                      <span className="font-mono text-white font-bold">
                        v{String((guardian.policy as any)?.version ?? '1')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                      <span className="text-[#8A8A92] block mb-0.5 text-[11px] uppercase tracking-wider font-display">Base Allow-Lists</span>
                      <span className={`font-semibold font-mono text-[11px] ${guardian.base_allow_lists_unchanged ? 'text-[#E8E8EC]' : 'text-[#FF2A2A]'}`}>
                        {guardian.base_allow_lists_unchanged ? 'UNCHANGED (SECURE)' : 'MODIFIED'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                      <span className="text-[#8A8A92] block mb-0.5 text-[11px] uppercase tracking-wider font-display">Held-out Learning</span>
                      <span className={`font-semibold font-mono text-[11px] ${guardian.heldout_learning_enabled ? 'text-[#FF2A2A]' : 'text-[#8A8A92]'}`}>
                        {guardian.heldout_learning_enabled ? 'ENABLED' : 'DISABLED (ISOLATED)'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <SafeJsonViewer
                      data={guardian.policy}
                      label="Active Guardian Policy Rules"
                      defaultExpanded={false}
                    />
                  </div>
                </div>
              ) : (
                <EmptyState description="No active guardian policy data available." />
              )}
            </div>
          </div>

          {/* Latest Benchmark & Scoreboard Trends */}
          <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(192,192,192,0.1)] mb-4">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-[#FF2A2A]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                    Latest Benchmark Scoreboard
                  </h3>
                </div>
                <Link
                  to="/benchmarks"
                  className="text-xs text-[#C0C0C0] hover:text-[#FF2A2A] inline-flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Scoreboard</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              {scoreboardLoading ? (
                <CardSkeleton />
              ) : scoreboardError ? (
                <ErrorCard message={scoreboardError} onRetry={fetchScoreboard} />
              ) : scoreboard && scoreboard.items && scoreboard.items.length > 0 && latestScoreboardItem ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                    <div className="flex items-center justify-between text-xs text-[#8A8A92] mb-2">
                      <span className="font-semibold text-white font-display uppercase tracking-wider">Latest Summary Run</span>
                      <span className="font-mono text-[11px] text-[#8A8A92]">
                        {new Date(latestScoreboardItem.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      {Object.entries(latestSummary)
                        .filter(([k]) => typeof latestSummary[k] === 'number')
                        .slice(0, 6)
                        .map(([k, v]) => (
                          <div key={k} className="p-2.5 rounded-lg bg-[rgba(18,18,22,0.7)] border border-[rgba(192,192,192,0.1)]">
                            <span className="text-[10px] text-[#8A8A92] block uppercase tracking-wider truncate font-display" title={k}>
                              {k.replace(/_/g, ' ')}
                            </span>
                            <span className="font-mono font-bold text-white text-xs">
                              {typeof v === 'number' && v <= 1 && v > 0
                                ? `${(v * 100).toFixed(1)}%`
                                : String(v)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Trend chart representation across recent runs */}
                  <div className="p-4 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[rgba(192,192,192,0.1)]">
                    <span className="text-xs font-semibold text-[#8A8A92] block mb-2 font-display uppercase tracking-wider">
                      Recent Benchmark Score Trend ({scoreboard.items.length} records)
                    </span>
                    <div className="flex items-end gap-2 h-20 pt-2 border-b border-[rgba(192,192,192,0.1)]">
                      {scoreboard.items.slice(0, 8).reverse().map((item, idx) => {
                        const rate =
                          typeof item.summary?.heldout_block_rate === 'number'
                            ? item.summary.heldout_block_rate
                            : typeof item.summary?.action_block_rate === 'number'
                            ? item.summary.action_block_rate
                            : 0.5;
                        const heightPct = Math.max(Math.round(rate * 100), 12);
                        return (
                          <div key={item.id || idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full rounded-t bg-gradient-to-t from-[#8B0000] via-[#E10600] to-[#FF2A2A] group-hover:from-[#E10600] group-hover:to-[#FF2A2A] shadow-[0_0_10px_rgba(225,6,0,0.3)] transition-all duration-300"
                              title={`Score: ${(rate * 100).toFixed(1)}% (${new Date(item.created_at).toLocaleTimeString()})`}
                            />
                            <span className="text-[9px] font-mono text-[#8A8A92]">#{idx + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No Benchmark History"
                  description="Run your first security benchmark to generate scoreboards."
                  actionText="Launch Benchmark"
                  onAction={() => window.location.assign('/benchmarks')}
                />
              )}
            </div>
          </div>
        </div>

        {/* Recent Runs Table */}
        <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(192,192,192,0.1)] mb-4">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#FF2A2A]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                Recent Security Evaluation Runs
              </h3>
            </div>
            <Link
              to="/runs"
              className="text-xs text-[#C0C0C0] hover:text-[#FF2A2A] inline-flex items-center gap-1 font-medium transition-colors"
            >
              <span>View All Runs</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {runsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 skeleton-shimmer rounded-xl border border-white/[0.04]" />
              ))}
            </div>
          ) : runsError ? (
            <ErrorCard message={runsError} onRetry={fetchRuns} />
          ) : runs.length === 0 ? (
            <EmptyState
              title="No Runs Recorded"
              description="Execute an evaluation, arena round, or campaign to record security telemetry."
              actionText="Run Evaluation"
              onAction={() => window.location.assign('/evaluations')}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[rgba(192,192,192,0.1)]">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-[#8A8A92] border-b border-[rgba(192,192,192,0.12)] bg-[rgba(11,11,13,0.9)] sticky top-0 font-display">
                  <tr>
                    <th className="py-3 px-3.5">Run ID / Trace</th>
                    <th className="py-3 px-3.5">Scenario</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5">Actions (B/E)</th>
                    <th className="py-3 px-3.5">Block Rate</th>
                    <th className="py-3 px-3.5">Created</th>
                    <th className="py-3 px-3.5 text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(192,192,192,0.06)] bg-[rgba(15,15,18,0.5)]">
                  {runs.map((run, idx) => {
                    const blocked = run.metrics?.blocked_actions ?? 0;
                    const executed = run.metrics?.executed_actions ?? 0;
                    const rate =
                      run.metrics?.action_block_rate !== undefined
                        ? (Number(run.metrics.action_block_rate) * 100).toFixed(0) + '%'
                        : '-';

                    return (
                      <tr
                        key={run.id || idx}
                        className={`transition-colors hover:bg-[rgba(225,6,0,0.06)] ${
                          idx % 2 === 1 ? 'bg-white/[0.02]' : ''
                        }`}
                      >
                        <td className="py-3 px-3.5 font-mono font-medium text-[#E8E8EC]">
                          <span className="text-[#E8E8EC] font-semibold">{run.id?.slice(0, 8)}...</span>
                          <span className="block text-[10px] text-[#8A8A92]">{run.trace_id?.slice(0, 8)}...</span>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-white capitalize font-sans">
                          {run.scenario?.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-3.5">
                          <DecisionBadge allowed={run.status === 'completed'} />
                        </td>
                        <td className="py-3 px-3.5 font-mono">
                          <span className="text-[#FF2A2A] font-bold">{blocked}</span>
                          <span className="text-[#8A8A92] mx-1">/</span>
                          <span className="text-[#E8E8EC] font-bold">{executed}</span>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[#FF2A2A] font-bold">
                          {rate}
                        </td>
                        <td className="py-3 px-3.5 text-[#8A8A92] text-[11px] font-mono">
                          {new Date(run.created_at).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <Link
                            to={`/runs/${run.id}`}
                            className="inline-flex items-center gap-1 text-[#C0C0C0] hover:text-[#FF2A2A] font-semibold text-xs transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
