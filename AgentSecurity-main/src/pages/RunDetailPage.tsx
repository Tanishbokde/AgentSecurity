import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Shield,
  AlertTriangle,
  Terminal,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Run } from '../types/api';
import { AppLayout } from '../components/AppLayout';
import { DecisionBadge, ExecutedBadge, RiskBadge } from '../components/RiskBadge';
import { SafeJsonViewer } from '../components/SafeJsonViewer';
import { ErrorCard, LoadingSkeleton } from '../components/DataStates';
import { PageHeader } from '../components/PageHeader';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { Button } from '../components/Button';

export const RunDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getRun(id);
        setRun(data);
      } catch (err: any) {
        if (err instanceof ApiError) {
          setError({ status: err.status, message: err.message });
        } else {
          setError({ message: err.message || 'Failed to fetch run details.' });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <AppLayout executionMode="SYNTHETIC_ONLY">
        <div className="space-y-6 text-left font-sans">
          <div className="h-8 skeleton-shimmer rounded w-1/4" />
          <LoadingSkeleton rows={8} />
        </div>
      </AppLayout>
    );
  }

  if (error || !run) {
    return (
      <AppLayout executionMode="SYNTHETIC_ONLY">
        <div className="max-w-2xl mx-auto py-12 text-left font-sans">
          <Link
            to="/runs"
            className="inline-flex items-center gap-1.5 text-xs text-[#8A8A92] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Runs List</span>
          </Link>

          <ErrorCard
            title={error?.status === 404 ? 'Run Not Found' : error?.status === 400 ? 'Malformed Run ID' : 'Run Inspection Error'}
            message={error?.message || 'The specified run trace could not be loaded.'}
            onRetry={() => window.location.reload()}
          />
        </div>
      </AppLayout>
    );
  }

  const metrics = run.metrics || {};
  const actions = run.actions || [];

  return (
    <AppLayout executionMode={run.execution_mode || 'SYNTHETIC_ONLY'}>
      <div className="space-y-6 text-left font-sans">
        {/* Navigation & Header */}
        <PageHeader
          title="Run Trace Inspection"
          subtitle={`ID: ${run.id}`}
          breadcrumbs={[
            { label: 'Security Enclave', to: '/dashboard' },
            { label: 'Runs', to: '/runs' },
            { label: run.id ? `${run.id.slice(0, 8)}...` : 'Detail' },
          ]}
          badge={<DecisionBadge allowed={run.status === 'completed'} />}
          actions={
            <div className="flex items-center gap-2">
              <Link to="/runs">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
                  Runs
                </Button>
              </Link>
              <Link to={`/replay/${run.id}`}>
                <Button variant="primary" size="sm" leftIcon={<Play size={12} />}>
                  Replay
                </Button>
              </Link>
            </div>
          }
        />

        {/* Metadata Header Card */}
        <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#8A8A92] block mb-1 uppercase tracking-wider font-display text-[10px]">Scenario</span>
              <span className="font-semibold text-white capitalize text-sm">
                {run.scenario?.replace(/_/g, ' ')}
              </span>
            </div>

            <div>
              <span className="text-[#8A8A92] block mb-1 uppercase tracking-wider font-display text-[10px]">Trace ID</span>
              <span className="font-mono text-[#E8E8EC] text-xs truncate block" title={run.trace_id}>
                {run.trace_id}
              </span>
            </div>

            <div>
              <span className="text-[#8A8A92] block mb-1 uppercase tracking-wider font-display text-[10px]">Execution Mode</span>
              <span className="font-mono font-semibold text-[#FF2A2A] text-xs">
                {run.execution_mode || 'SYNTHETIC_ONLY'}
              </span>
            </div>

            <div>
              <span className="text-[#8A8A92] block mb-1 uppercase tracking-wider font-display text-[10px]">Timestamp</span>
              <span className="text-[#E8E8EC] text-xs font-mono">
                {new Date(run.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
            <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Proposed</span>
            <span className="text-2xl font-bold font-display text-white tabular-nums">
              <AnimatedCounter value={metrics.proposed_actions ?? actions.length} />
            </span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
            <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Blocked</span>
            <span className="text-2xl font-bold font-display text-[#FF2A2A] tabular-nums drop-shadow-[0_0_8px_rgba(225,6,0,0.5)]">
              <AnimatedCounter value={metrics.blocked_actions ?? 0} />
            </span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
            <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Executed</span>
            <span className="text-2xl font-bold font-display text-[#E8E8EC] tabular-nums">
              <AnimatedCounter value={metrics.executed_actions ?? 0} />
            </span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
            <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Block Rate</span>
            <span className="text-2xl font-bold font-display text-[#FF2A2A] tabular-nums">
              {metrics.action_block_rate !== undefined
                ? (Number(metrics.action_block_rate) * 100).toFixed(0) + '%'
                : '-'}
            </span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)] col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Unauthorized</span>
            <span className={`text-2xl font-bold font-display tabular-nums ${metrics.unauthorized_executions ? 'text-[#FF2A2A]' : 'text-[#E8E8EC]'}`}>
              <AnimatedCounter value={metrics.unauthorized_executions ?? 0} />
            </span>
          </div>
        </div>

        {/* Prompt & Agent Response Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl glass-card border border-[rgba(225,6,0,0.3)] shadow-[0_0_20px_rgba(225,6,0,0.15)]">
            <div className="flex items-center gap-2 text-[#FF2A2A] text-xs font-bold uppercase tracking-wider font-display mb-2">
              <AlertTriangle size={15} />
              <span>Red Team Attack / Prompt</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[rgba(5,5,6,0.7)] border border-[rgba(225,6,0,0.2)] text-[#E8E8EC] text-xs font-mono leading-relaxed select-text whitespace-pre-wrap break-words min-h-[60px]">
              {run.red_team_attack || '<No red team payload recorded>'}
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
            <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider font-display mb-2">
              <Terminal size={15} />
              <span>Target Agent Response</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[rgba(5,5,6,0.7)] border border-[rgba(192,192,192,0.12)] text-[#E8E8EC] text-xs font-mono leading-relaxed select-text whitespace-pre-wrap break-words min-h-[60px]">
              {run.target_response || '<No target agent response recorded>'}
            </div>
          </div>
        </div>

        {/* Actions Telemetry List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(192,192,192,0.1)]">
            <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2 font-display">
              <Shield size={18} className="text-[#FF2A2A]" />
              <span>Evaluated Tool Actions ({actions.length})</span>
            </h2>
          </div>

          {actions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-card border border-[rgba(192,192,192,0.12)] text-[#8A8A92] text-xs">
              No individual tool actions were recorded in this run.
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action, idx) => (
                <div
                  key={action.trace_id || idx}
                  className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] space-y-3.5"
                >
                  {/* Action Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[rgba(192,192,192,0.08)]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[rgba(225,6,0,0.12)] border border-[#FF2A2A]/30 text-[11px] font-mono text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        {action.tool}
                      </span>
                      <RiskBadge risk={action.risk} />
                    </div>

                    <div className="flex items-center gap-2">
                      <DecisionBadge allowed={action.allowed} />
                      <ExecutedBadge executed={action.executed} />
                    </div>
                  </div>

                  {/* Policy & Provenance Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#8A8A92]">
                    <div>
                      <span className="block text-[10px] uppercase font-display text-[#8A8A92]/70">Provenance</span>
                      <span className="font-mono text-[#E8E8EC]">{action.provenance || 'unknown'}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-display text-[#8A8A92]/70">Guardian Policy</span>
                      <span className="font-mono text-[#E8E8EC]">
                        {typeof action.guardian_policy === 'object'
                          ? JSON.stringify(action.guardian_policy)
                          : String(action.guardian_policy || 'default')}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-display text-[#8A8A92]/70">Trace ID</span>
                      <span className="font-mono text-[#8A8A92] text-[11px] truncate block" title={action.trace_id}>
                        {action.trace_id}
                      </span>
                    </div>
                  </div>

                  {/* Guardian Reason */}
                  {action.reason && (
                    <div className="p-3.5 rounded-xl bg-[rgba(11,11,13,0.7)] border border-[#FF2A2A]/25 text-xs">
                      <span className="text-[10px] uppercase tracking-wider text-[#FF2A2A] font-bold block mb-1 font-display">
                        Decision Rationale:
                      </span>
                      <p className="text-[#E8E8EC] select-text leading-relaxed font-sans">
                        {action.reason}
                      </p>
                    </div>
                  )}

                  {/* Collapsible Arguments & Results Payloads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <SafeJsonViewer
                      data={action.arguments}
                      label="Tool Arguments"
                      defaultExpanded={false}
                    />

                    <SafeJsonViewer
                      data={action.result}
                      label="Tool Execution Result"
                      defaultExpanded={false}
                    />
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
