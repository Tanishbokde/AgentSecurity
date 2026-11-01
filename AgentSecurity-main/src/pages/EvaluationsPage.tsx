import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Play,
  XCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { api } from '../lib/api';
import type { EvaluationResponse, Run } from '../types/api';
import { AppLayout } from '../components/AppLayout';
import { DecisionBadge } from '../components/RiskBadge';
import { ErrorCard } from '../components/DataStates';
import { PageHeader } from '../components/PageHeader';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { Button } from '../components/Button';

export const EvaluationsPage: React.FC = () => {
  const [rounds, setRounds] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await api.runEvaluation({ rounds }, controller.signal);
      setResult(data);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.status === 408) {
        setError('Evaluation was cancelled or timed out. You can retry with fewer rounds.');
      } else {
        setError(err.message || 'Failed to complete evaluation run.');
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

  const summary = result?.summary;

  return (
    <AppLayout executionMode={summary?.execution_mode || 'SYNTHETIC_ONLY'}>
      <div className="space-y-6 text-left font-sans">
        {/* Page Title */}
        <PageHeader
          title="Security Evaluation Suite"
          subtitle="Execute rotating benchmark scenarios (safe file read, prompt injection, invoice workflow, mixed)"
          icon={<Layers size={22} />}
          breadcrumbs={[
            { label: 'Security Enclave', to: '/dashboard' },
            { label: 'Evaluations' },
          ]}
        />

        {/* Configuration Form Card */}
        <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
          <form onSubmit={handleRun} className="space-y-4">
            <div className="max-w-xs space-y-1.5">
              <label htmlFor="rounds" className="text-xs font-semibold uppercase tracking-wider text-[#E8E8EC] font-display">
                Evaluation Rounds (1 - 10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="rounds"
                  type="number"
                  min={1}
                  max={10}
                  value={rounds}
                  onChange={(e) => setRounds(Math.min(10, Math.max(1, Number(e.target.value))))}
                  disabled={loading}
                  className="w-24 h-10 px-3 rounded-xl glass-input text-white text-sm font-mono custom-caret disabled:opacity-50"
                />
                <span className="text-xs text-[#8A8A92]">
                  Recommended: 4 rounds
                </span>
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
                    Executing synchronous security evaluation across {rounds} rounds... This may take up to 60-120 seconds.
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
                title="Evaluation Error"
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
                {loading ? 'Evaluating...' : 'Start Evaluation'}
              </Button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {summary && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-[rgba(192,192,192,0.1)]">
              <CheckCircle2 size={18} className="text-white" />
              <h2 className="text-base font-bold uppercase tracking-wider text-white font-display">
                Evaluation Summary ({summary.rounds} Rounds Completed)
              </h2>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
                <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Proposed</span>
                <span className="text-2xl font-bold font-display text-white tabular-nums">
                  <AnimatedCounter value={summary.proposed_actions ?? 0} />
                </span>
              </div>

              <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
                <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Blocked</span>
                <span className="text-2xl font-bold font-display text-[#FF2A2A] tabular-nums drop-shadow-[0_0_8px_rgba(225,6,0,0.5)]">
                  <AnimatedCounter value={summary.blocked_actions ?? 0} />
                </span>
              </div>

              <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
                <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Executed</span>
                <span className="text-2xl font-bold font-display text-[#E8E8EC] tabular-nums">
                  <AnimatedCounter value={summary.executed_actions ?? 0} />
                </span>
              </div>

              <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
                <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Block Rate</span>
                <span className="text-2xl font-bold font-display text-[#FF2A2A] tabular-nums">
                  {summary.action_block_rate !== undefined
                    ? `${(Number(summary.action_block_rate) * 100).toFixed(0)}%`
                    : '-'}
                </span>
              </div>

              <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
                <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Legit Success</span>
                <span className="text-2xl font-bold font-display text-white tabular-nums">
                  {summary.legitimate_task_success_rate !== undefined
                    ? `${(Number(summary.legitimate_task_success_rate) * 100).toFixed(0)}%`
                    : '-'}
                </span>
              </div>

              <div className="p-4 rounded-xl glass-card border border-[rgba(192,192,192,0.12)]">
                <span className="text-[10px] text-[#8A8A92] uppercase tracking-wider font-display block mb-1">Unauthorized</span>
                <span className={`text-2xl font-bold font-display tabular-nums ${summary.unauthorized_executions ? 'text-[#FF2A2A]' : 'text-[#E8E8EC]'}`}>
                  <AnimatedCounter value={summary.unauthorized_executions ?? 0} />
                </span>
              </div>
            </div>

            {/* Runs Table */}
            <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8E8EC] font-display mb-3">
                Evaluated Runs ({result?.runs?.length || 0})
              </h3>

              <div className="overflow-x-auto rounded-xl border border-[rgba(192,192,192,0.1)]">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] uppercase tracking-wider text-[#8A8A92] border-b border-[rgba(192,192,192,0.12)] bg-[rgba(11,11,13,0.9)] sticky top-0 font-display">
                    <tr>
                      <th className="py-3 px-3.5">Run ID</th>
                      <th className="py-3 px-3.5">Scenario</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5">Actions (P / B / E)</th>
                      <th className="py-3 px-3.5">Block Rate</th>
                      <th className="py-3 px-3.5 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(192,192,192,0.06)] bg-[rgba(15,15,18,0.5)]">
                    {result?.runs?.map((run: Run, idx: number) => (
                      <tr
                        key={run.id || idx}
                        className={`transition-colors hover:bg-[rgba(225,6,0,0.06)] ${
                          idx % 2 === 1 ? 'bg-white/[0.02]' : ''
                        }`}
                      >
                        <td className="py-3 px-3.5 font-mono font-medium text-[#E8E8EC]">
                          {run.id?.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-3.5 capitalize font-medium text-white font-sans">
                          {run.scenario?.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-3.5">
                          <DecisionBadge allowed={run.status === 'completed'} />
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[#8A8A92]">
                          <span className="text-[#E8E8EC]">{run.metrics?.proposed_actions ?? run.actions?.length ?? 0}</span>
                          <span className="text-[#8A8A92]/50 mx-1">/</span>
                          <span className="text-[#FF2A2A] font-bold">{run.metrics?.blocked_actions ?? 0}</span>
                          <span className="text-[#8A8A92]/50 mx-1">/</span>
                          <span className="text-[#E8E8EC] font-bold">{run.metrics?.executed_actions ?? 0}</span>
                        </td>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#FF2A2A]">
                          {run.metrics?.action_block_rate !== undefined
                            ? `${(Number(run.metrics.action_block_rate) * 100).toFixed(0)}%`
                            : '-'}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <Link
                            to={`/runs/${run.id}`}
                            className="inline-flex items-center gap-1 text-[#C0C0C0] hover:text-[#FF2A2A] font-semibold text-xs transition-colors"
                          >
                            <span>Details</span>
                            <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
