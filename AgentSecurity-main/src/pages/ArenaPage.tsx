import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Swords,
  Play,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../lib/api';
import type { ArenaResponse, ArenaHistoryResponse, ArenaRound, ArenaCase } from '../types/api';
import { AppLayout } from '../components/AppLayout';
import { ErrorCard, EmptyState, LoadingSkeleton } from '../components/DataStates';
import { SafeJsonViewer } from '../components/SafeJsonViewer';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';

export const ArenaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'run' | 'history'>('run');

  // Run Form State
  const [rounds, setRounds] = useState(3);
  const [attacksPerRound, setAttacksPerRound] = useState(4);
  const [includeHeldout, setIncludeHeldout] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [arenaResult, setArenaResult] = useState<ArenaResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // History State
  const [history, setHistory] = useState<ArenaHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await api.getArenaHistory(20);
      setHistory(data);
    } catch (err: any) {
      setHistoryError(err.message || 'Failed to fetch arena history');
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
      const data = await api.runArena(
        {
          rounds,
          attacks_per_round: attacksPerRound,
          include_heldout: includeHeldout,
        },
        controller.signal
      );
      setArenaResult(data);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.status === 408) {
        setError('Arena run was cancelled or timed out.');
      } else {
        setError(err.message || 'Failed to execute arena run.');
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
    <AppLayout executionMode={arenaResult?.execution_mode || 'SYNTHETIC_ONLY'}>
      <div className="space-y-6 text-left font-sans">
        {/* Header with Tabs */}
        <PageHeader
          title="Red-Team Attack Arena"
          subtitle="Simulate adversarial multi-family attack rounds against security guardian policies"
          icon={<Swords size={22} />}
          breadcrumbs={[
            { label: 'Security Enclave', to: '/dashboard' },
            { label: 'Arena' },
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
                Run Arena
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
            {/* Arena Configuration Form */}
            <div className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)]">
              <form onSubmit={handleRun} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Rounds */}
                  <div className="space-y-1.5">
                    <label htmlFor="arena-rounds" className="text-xs font-semibold uppercase tracking-wider text-[#E8E8EC] font-display">
                      Rounds (1 - 5)
                    </label>
                    <input
                      id="arena-rounds"
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
                    <label htmlFor="arena-attacks" className="text-xs font-semibold uppercase tracking-wider text-[#E8E8EC] font-display">
                      Attacks per Round (1 - 8)
                    </label>
                    <input
                      id="arena-attacks"
                      type="number"
                      min={1}
                      max={8}
                      value={attacksPerRound}
                      onChange={(e) => setAttacksPerRound(Math.min(8, Math.max(1, Number(e.target.value))))}
                      disabled={loading}
                      className="w-full h-10 px-3 rounded-xl glass-input text-white text-sm font-mono custom-caret disabled:opacity-50"
                    />
                    <span className="text-[11px] text-[#8A8A92] block">Default: 4</span>
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
                        Include Held-out Dataset
                      </span>
                    </label>
                    <span className="text-[11px] text-[#8A8A92] block">Evaluate generalization</span>
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
                        Simulating adversarial red-team arena across {rounds} rounds... This operation may take 60-120 seconds.
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
                    title="Arena Execution Error"
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
                    {loading ? 'Simulating Arena...' : 'Launch Arena Run'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Arena Results: One card per round */}
            {arenaResult && arenaResult.rounds && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(192,192,192,0.1)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-white" />
                    <h2 className="text-base font-bold uppercase tracking-wider text-white font-display">
                      Arena Outcome: {arenaResult.status} ({arenaResult.rounds.length} Rounds)
                    </h2>
                  </div>
                  {arenaResult.note && (
                    <span className="text-xs text-[#8A8A92] italic font-mono">{arenaResult.note}</span>
                  )}
                </div>

                {arenaResult.rounds.map((round: ArenaRound, rIdx: number) => {
                  const roundNum = round.summary?.round ?? (rIdx + 1);
                  const cases = round.cases || [];

                  return (
                    <div
                      key={round.id || rIdx}
                      className="p-6 rounded-2xl glass-card border border-[rgba(192,192,192,0.14)] space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(192,192,192,0.08)]">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-[rgba(225,6,0,0.18)] text-white font-mono text-xs font-bold border border-[#FF2A2A]/40 shadow-[0_0_10px_rgba(225,6,0,0.25)]">
                            ROUND #{roundNum}
                          </span>
                          <span className="text-xs text-[#8A8A92] font-mono">
                            {cases.length} Simulated Attack Cases
                          </span>
                        </div>

                        {round.summary?.guardian_feedback && (
                          <div className="text-xs font-mono text-[#E8E8EC] bg-[rgba(15,15,18,0.7)] px-3 py-1 rounded-lg border border-[#FF2A2A]/30">
                            Guardian Feedback: {typeof round.summary.guardian_feedback === 'string'
                              ? round.summary.guardian_feedback
                              : JSON.stringify(round.summary.guardian_feedback)}
                          </div>
                        )}
                      </div>

                      {/* Cases Table */}
                      <div className="overflow-x-auto rounded-xl border border-[rgba(192,192,192,0.1)]">
                        <table className="w-full text-xs text-left">
                          <thead className="text-[11px] uppercase tracking-wider text-[#8A8A92] border-b border-[rgba(192,192,192,0.12)] bg-[rgba(11,11,13,0.9)] sticky top-0 font-display">
                            <tr>
                              <th className="py-3 px-3.5">Case ID</th>
                              <th className="py-3 px-3.5">Split</th>
                              <th className="py-3 px-3.5">Family</th>
                              <th className="py-3 px-3.5">Scenario</th>
                              <th className="py-3 px-3.5">Objective</th>
                              <th className="py-3 px-3.5">Verdict</th>
                              <th className="py-3 px-3.5 text-right">Links</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(192,192,192,0.06)] bg-[rgba(15,15,18,0.5)]">
                            {cases.map((c: ArenaCase, cIdx: number) => (
                              <tr
                                key={c.case_id || cIdx}
                                className={`transition-colors hover:bg-[rgba(225,6,0,0.06)] ${
                                  cIdx % 2 === 1 ? 'bg-white/[0.02]' : ''
                                }`}
                              >
                                <td className="py-3 px-3.5 font-mono font-medium text-[#E8E8EC]">
                                  {c.case_id}
                                </td>
                                <td className="py-3 px-3.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                                      c.split === 'heldout'
                                        ? 'bg-[rgba(225,6,0,0.15)] text-[#FF2A2A] border border-[#FF2A2A]/40'
                                        : 'bg-[rgba(192,192,192,0.12)] text-[#E8E8EC] border border-[rgba(192,192,192,0.25)]'
                                    }`}
                                  >
                                    {c.split}
                                  </span>
                                </td>
                                <td className="py-3 px-3.5 font-mono text-[#E8E8EC]">
                                  {c.family}
                                </td>
                                <td className="py-3 px-3.5 text-white capitalize font-sans">
                                  {c.scenario?.replace(/_/g, ' ')}
                                </td>
                                <td className="py-3 px-3.5 text-[#8A8A92] max-w-xs truncate" title={c.objective}>
                                  {c.objective}
                                </td>
                                <td className="py-3 px-3.5">
                                  <span className="font-mono text-xs font-semibold text-[#E8E8EC] bg-[rgba(225,6,0,0.08)] px-2 py-0.5 rounded border border-[#FF2A2A]/25">
                                    {typeof c.verdict === 'object'
                                      ? JSON.stringify(c.verdict)
                                      : String(c.verdict)}
                                  </span>
                                </td>
                                <td className="py-3 px-3.5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {c.run_id && (
                                      <Link
                                        to={`/runs/${c.run_id}`}
                                        className="text-[#C0C0C0] hover:text-[#FF2A2A] font-semibold text-xs transition-colors"
                                        title="View Run Detail"
                                      >
                                        Run
                                      </Link>
                                    )}
                                    {c.run_id && (
                                      <Link
                                        to={`/replay/${c.run_id}`}
                                        className="text-[#FF2A2A] hover:text-white font-semibold text-xs transition-colors"
                                        title="View Replay"
                                      >
                                        Replay
                                      </Link>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
                title="No Arena History"
                description="Launch an arena round to build your adversarial testing history."
                actionText="Launch Arena"
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
                        Arena Session: {item.id}
                      </span>
                      <span className="font-mono">{new Date(item.created_at).toLocaleString()}</span>
                    </div>

                    {item.summary && (
                      <SafeJsonViewer
                        data={item.summary}
                        label="Arena Summary Telemetry"
                        defaultExpanded={false}
                      />
                    )}

                    {item.cases && item.cases.length > 0 && (
                      <div className="text-xs text-[#8A8A92] font-mono">
                        {item.cases.length} cases recorded in this session.
                      </div>
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
