import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, Play, RefreshCw, Eye } from 'lucide-react';
import { api } from '../lib/api';
import type { Run } from '../types/api';
import { AppLayout } from '../components/AppLayout';
import { DecisionBadge } from '../components/RiskBadge';
import { ErrorCard, EmptyState, LoadingSkeleton } from '../components/DataStates';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';

export const RunsListPage: React.FC = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  // Client-side filtering & search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRuns(limit);
      setRuns(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch runs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [limit]);

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchesSearch =
        search === '' ||
        run.scenario?.toLowerCase().includes(search.toLowerCase()) ||
        run.id?.toLowerCase().includes(search.toLowerCase()) ||
        run.trace_id?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        run.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [runs, search, statusFilter]);

  return (
    <AppLayout executionMode="SYNTHETIC_ONLY">
      <div className="space-y-6 text-left font-sans">
        {/* Page Title & Controls */}
        <PageHeader
          title="Evaluation Runs History"
          subtitle="Comprehensive audit trail of security evaluation traces and decisions"
          icon={<History size={22} />}
          breadcrumbs={[
            { label: 'Security Enclave', to: '/dashboard' },
            { label: 'Runs' },
          ]}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchRuns}
              leftIcon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
            >
              Refresh
            </Button>
          }
        />

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A92]" />
            <input
              type="text"
              placeholder="Search by scenario, Run ID, or Trace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-xl glass-input text-white text-xs placeholder-[#8A8A92]/60 custom-caret"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 text-xs text-[#8A8A92]">
              <span className="font-display uppercase tracking-wider text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-xl glass-input text-white text-xs cursor-pointer font-sans"
              >
                <option value="all" className="bg-[#0B0B0D] text-white">All Statuses</option>
                <option value="completed" className="bg-[#0B0B0D] text-white">Completed</option>
                <option value="failed" className="bg-[#0B0B0D] text-white">Failed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8A8A92]">
              <span className="font-display uppercase tracking-wider text-[11px]">Limit:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="h-10 px-3 rounded-xl glass-input text-white text-xs cursor-pointer font-mono"
              >
                <option value={10} className="bg-[#0B0B0D] text-white">10</option>
                <option value={20} className="bg-[#0B0B0D] text-white">20</option>
                <option value={50} className="bg-[#0B0B0D] text-white">50</option>
                <option value={100} className="bg-[#0B0B0D] text-white">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Runs List Table */}
        <div className="p-5 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
          {loading ? (
            <LoadingSkeleton rows={6} />
          ) : error ? (
            <ErrorCard message={error} onRetry={fetchRuns} />
          ) : filteredRuns.length === 0 ? (
            <EmptyState
              title="No Runs Found"
              description={
                search || statusFilter !== 'all'
                  ? 'No runs matched the specified search or filter criteria.'
                  : 'No evaluation runs recorded in the database yet.'
              }
              actionText="Run Evaluation"
              onAction={() => window.location.assign('/evaluations')}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[rgba(192,192,192,0.1)]">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-[#8A8A92] border-b border-[rgba(192,192,192,0.12)] bg-[rgba(11,11,13,0.9)] sticky top-0 font-display">
                  <tr>
                    <th className="py-3 px-3.5">Run ID</th>
                    <th className="py-3 px-3.5">Scenario</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5">Actions (P / B / E)</th>
                    <th className="py-3 px-3.5">Block Rate</th>
                    <th className="py-3 px-3.5">Mode</th>
                    <th className="py-3 px-3.5">Created</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(192,192,192,0.06)] bg-[rgba(15,15,18,0.5)]">
                  {filteredRuns.map((run, idx) => {
                    const proposed = run.metrics?.proposed_actions ?? run.actions?.length ?? 0;
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
                        <td className="py-3 px-3.5 font-mono">
                          <Link
                            to={`/runs/${run.id}`}
                            className="text-[#E8E8EC] hover:text-[#FF2A2A] font-semibold transition-colors"
                            title={run.id}
                          >
                            {run.id?.slice(0, 8)}...
                          </Link>
                          <span className="block text-[10px] text-[#8A8A92] font-mono">
                            {run.trace_id?.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-white capitalize font-sans">
                          {run.scenario?.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-3.5">
                          <DecisionBadge allowed={run.status === 'completed'} />
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[#8A8A92]">
                          <span className="text-[#E8E8EC]">{proposed}</span>
                          <span className="text-[#8A8A92]/50 mx-1">/</span>
                          <span className="text-[#FF2A2A] font-bold">{blocked}</span>
                          <span className="text-[#8A8A92]/50 mx-1">/</span>
                          <span className="text-[#E8E8EC] font-bold">{executed}</span>
                        </td>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#FF2A2A]">
                          {rate}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 rounded bg-[rgba(225,6,0,0.1)] text-[#E8E8EC] border border-[#FF2A2A]/30 text-[10px] font-mono tracking-wider">
                            {run.execution_mode || 'SYNTHETIC'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-[#8A8A92] text-[11px] whitespace-nowrap font-mono">
                          {new Date(run.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/runs/${run.id}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(15,15,18,0.7)] hover:bg-[rgba(225,6,0,0.1)] border border-[rgba(192,192,192,0.16)] hover:border-[#FF2A2A]/40 text-[#E8E8EC] text-[11px] font-medium transition-colors"
                              title="Inspect full run details and actions"
                            >
                              <Eye size={12} className="text-[#C0C0C0]" />
                              <span>Inspect</span>
                            </Link>

                            <Link
                              to={`/replay/${run.id}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#FF2A2A] to-[#8B0000] border border-[#FF2A2A]/50 text-white text-[11px] font-bold shadow-[0_0_12px_rgba(225,6,0,0.4)] hover:shadow-[0_0_18px_rgba(255,42,42,0.6)] transition-all"
                              title="View read-only timeline replay"
                            >
                              <Play size={10} />
                              <span>Replay</span>
                            </Link>
                          </div>
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
