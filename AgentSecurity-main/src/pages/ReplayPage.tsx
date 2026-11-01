import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { BenchmarkReplayResponse, ReplayTimelineEvent } from '../types/api';
import { AppLayout } from '../components/AppLayout';
import { DecisionBadge, ExecutedBadge, RiskBadge } from '../components/RiskBadge';
import { ErrorCard, LoadingSkeleton } from '../components/DataStates';
import { PageHeader } from '../components/PageHeader';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { Button } from '../components/Button';

export const ReplayPage: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();
  const [replay, setReplay] = useState<BenchmarkReplayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);

  useEffect(() => {
    if (!runId) return;
    const fetchReplay = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getBenchmarkReplay(runId);
        setReplay(data);
      } catch (err: any) {
        if (err instanceof ApiError) {
          setError({ status: err.status, message: err.message });
        } else {
          setError({ message: err.message || 'Failed to fetch trace replay data.' });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReplay();
  }, [runId]);

  if (loading) {
    return (
      <AppLayout executionMode="READ_ONLY_REPLAY">
        <div className="space-y-6 text-left font-sans">
          <div className="h-8 skeleton-shimmer rounded w-1/4" />
          <LoadingSkeleton rows={8} />
        </div>
      </AppLayout>
    );
  }

  if (error || !replay) {
    return (
      <AppLayout executionMode="READ_ONLY_REPLAY">
        <div className="max-w-2xl mx-auto py-12 text-left font-sans">
          <Link
            to="/runs"
            className="inline-flex items-center gap-1.5 text-xs text-[#8A8A92] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Runs</span>
          </Link>

          <ErrorCard
            title={error?.status === 404 ? 'Replay Not Found' : 'Replay Error'}
            message={error?.message || 'Could not load replay trace for this run ID.'}
            onRetry={() => window.location.reload()}
          />
        </div>
      </AppLayout>
    );
  }

  const timeline = [...(replay.timeline || [])].sort((a, b) => a.sequence - b.sequence);
  const metrics = replay.metrics || {};

  return (
    <AppLayout executionMode={replay.execution_mode || 'READ_ONLY_REPLAY'}>
      <div className="space-y-6 text-left font-sans">
        {/* Navigation & Title */}
        <PageHeader
          title="Trace Replay Timeline"
          subtitle={`Run: ${replay.run_id} • Scenario: ${replay.scenario}`}
          icon={<Clock size={22} />}
          breadcrumbs={[
            { label: 'Security Enclave', to: '/dashboard' },
            { label: 'Runs', to: '/runs' },
            { label: 'Replay' },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-lg bg-[rgba(225,6,0,0.15)] text-[#FF2A2A] border border-[#FF2A2A]/40 font-mono text-[11px] font-bold uppercase tracking-wider">
              {replay.execution_mode || 'READ_ONLY_REPLAY'}
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link to="/runs">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
                  Runs
                </Button>
              </Link>
              <Link to={`/runs/${replay.run_id}`}>
                <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={12} />}>
                  Inspect Payload
                </Button>
              </Link>
            </div>
          }
        />

        {/* Read-only Replay Notice Banner */}
        <div className="p-4 rounded-xl glass-card border border-[#FF2A2A]/30 bg-[rgba(225,6,0,0.06)] flex items-center justify-between flex-wrap gap-2 text-xs text-[#E8E8EC] shadow-[0_0_15px_rgba(225,6,0,0.15)]">
          <div className="flex items-center gap-2 font-display uppercase tracking-wider text-[11px]">
            <Info size={16} className="text-[#FF2A2A] shrink-0" />
            <span className="font-bold text-white">
              Read-only replay: tools are not re-executed
            </span>
          </div>
          {replay.note && (
            <span className="italic text-[#8A8A92] text-[11.5px] font-mono">
              {replay.note}
            </span>
          )}
        </div>

        {/* Replay Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
            <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
              Proposed Actions
            </span>
            <span className="text-2xl font-bold font-display text-white tabular-nums">
              <AnimatedCounter value={metrics.proposed_actions ?? timeline.length} />
            </span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
            <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
              Blocked Actions
            </span>
            <span className="text-2xl font-bold font-display text-[#FF2A2A] tabular-nums drop-shadow-[0_0_8px_rgba(225,6,0,0.5)]">
              <AnimatedCounter value={metrics.blocked_actions ?? 0} />
            </span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
            <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
              Executed Actions
            </span>
            <span className="text-2xl font-bold font-display text-[#E8E8EC] tabular-nums">
              <AnimatedCounter value={metrics.executed_actions ?? 0} />
            </span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
            <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">
              Block Rate
            </span>
            <span className="text-2xl font-bold font-display text-[#FF2A2A] tabular-nums">
              {metrics.action_block_rate !== undefined
                ? `${(Number(metrics.action_block_rate) * 100).toFixed(0)}%`
                : '-'}
            </span>
          </div>
        </div>

        {/* Read-Only Ordered Vertical Timeline */}
        <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-[rgba(192,192,192,0.08)] flex items-center gap-2 font-display">
            <Clock size={16} className="text-[#FF2A2A]" />
            <span>Execution Timeline Sequence ({timeline.length} events)</span>
          </h2>

          {timeline.length === 0 ? (
            <div className="text-xs text-[#8A8A92] py-8 text-center font-mono">
              No recorded timeline events for this replay session.
            </div>
          ) : (
            <div className="relative border-l-2 border-[#FF2A2A]/40 ml-4 space-y-6 pl-7 pt-2">
              {timeline.map((event: ReplayTimelineEvent, idx: number) => (
                <div key={event.sequence} className="relative group">
                  {/* Sequence Node Dot on vertical timeline - glowing red and pulsing in sequence */}
                  <div
                    className="absolute -left-[41px] top-1 w-7 h-7 rounded-full bg-[#050506] border-2 border-[#FF2A2A] text-[10px] font-mono font-bold text-white flex items-center justify-center shadow-[0_0_12px_rgba(255,42,42,0.7)] animate-pulse"
                    style={{ animationDelay: `${(idx % 6) * 0.2}s` }}
                  >
                    {event.sequence}
                  </div>

                  {/* Event Detail Card */}
                  <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)] hover:border-[#FF2A2A]/40 transition-all space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-white">
                          {event.tool}
                        </span>
                        <RiskBadge risk={event.risk} />
                      </div>

                      <div className="flex items-center gap-2">
                        <DecisionBadge allowed={event.allowed} />
                        <ExecutedBadge executed={event.executed} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#8A8A92]">
                      <div>
                        <span className="text-[10px] uppercase font-display text-[#8A8A92]/70 block">Policy Rule</span>
                        <span className="font-mono text-[#E8E8EC]">
                          {typeof event.policy === 'object'
                            ? JSON.stringify(event.policy)
                            : String(event.policy || 'default')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-display text-[#8A8A92]/70 block">Provenance</span>
                        <span className="font-mono text-[#E8E8EC]">{event.provenance || 'unknown'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-display text-[#8A8A92]/70 block">Trace ID</span>
                        <span className="font-mono text-[#8A8A92] truncate block" title={event.trace_id}>
                          {event.trace_id}
                        </span>
                      </div>
                    </div>

                    {event.reason && (
                      <div className="p-3 rounded-lg bg-[rgba(11,11,13,0.7)] border border-[#FF2A2A]/25 text-xs text-[#E8E8EC]">
                        <span className="text-[10px] uppercase font-bold text-[#FF2A2A] block mb-0.5 font-display">
                          Enforcement Rationale:
                        </span>
                        <p className="select-text leading-relaxed font-sans">{event.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
