import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import type { HealthResponse } from '../types/api';

export const HealthBadge: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'degraded' | 'unreachable'>('loading');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      const res = await api.health();
      setHealth(res);
      if (res.status === 'ok') {
        setStatus('ok');
      } else {
        setStatus('degraded');
      }
    } catch {
      setStatus('unreachable');
      setHealth(null);
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    loading: {
      color: 'bg-[rgba(15,15,18,0.7)] text-[#8A8A92] border-[rgba(192,192,192,0.15)]',
      dot: 'bg-[#8A8A92]',
      text: 'Checking API...',
    },
    ok: {
      color: 'bg-[rgba(192,192,192,0.08)] text-[#E8E8EC] border-[rgba(192,192,192,0.3)] shadow-[0_0_12px_rgba(192,192,192,0.15)]',
      dot: 'bg-[#FFFFFF] shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse',
      text: 'API: Online',
    },
    degraded: {
      color: 'bg-[rgba(225,6,0,0.1)] text-[#E8E8EC] border-[#FF2A2A]/50 ring-1 ring-[#E10600]/30',
      dot: 'bg-[#FF2A2A] shadow-[0_0_8px_rgba(255,42,42,0.8)]',
      text: 'API: Degraded',
    },
    unreachable: {
      color: 'bg-[rgba(225,6,0,0.2)] text-[#FF2A2A] border-[#E10600] shadow-[0_0_15px_rgba(225,6,0,0.4)]',
      dot: 'bg-[#FF2A2A] animate-pulse shadow-[0_0_8px_rgba(255,42,42,1)]',
      text: 'API: Unreachable',
    },
  }[status];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium transition-all ${config.color}`}
      title={`Backend Status: ${status.toUpperCase()} ${
        health?.database ? `| DB: ${health.database}` : ''
      } (Checked: ${lastChecked?.toLocaleTimeString() || 'just now'})`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
      <span className="font-mono text-[11px] font-semibold tracking-wide">{config.text}</span>
      {health?.database && (
        <span className="text-[10px] text-[#8A8A92] hidden sm:inline font-mono">
          [DB: {health.database}]
        </span>
      )}
      <button
        type="button"
        onClick={checkHealth}
        className="text-[#8A8A92] hover:text-[#FF2A2A] transition-colors ml-0.5 p-0.5 rounded focus:outline-none"
        title="Refresh health check"
      >
        <RefreshCw size={10} className={status === 'loading' ? 'animate-spin' : ''} />
      </button>
    </div>
  );
};
