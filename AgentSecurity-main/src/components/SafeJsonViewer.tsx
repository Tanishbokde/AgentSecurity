import React, { useState } from 'react';
import { Copy, Check, ChevronRight, ChevronDown } from 'lucide-react';

interface SafeJsonViewerProps {
  data: unknown;
  label?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export const SafeJsonViewer: React.FC<SafeJsonViewerProps> = ({
  data,
  label = 'Payload',
  defaultExpanded = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const formattedJson = React.useMemo(() => {
    try {
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return data;
        }
      }
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (data === undefined || data === null) {
    return <span className="text-[#8A8A92] italic text-xs font-mono">null</span>;
  }

  return (
    <div className={`rounded-xl border border-[rgba(192,192,192,0.14)] bg-[rgba(11,11,13,0.7)] backdrop-blur-md text-left overflow-hidden shadow-md ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[rgba(18,18,20,0.85)] hover:bg-[rgba(225,6,0,0.06)] border-b border-[rgba(192,192,192,0.08)] text-xs font-mono transition-colors text-[#E8E8EC]"
      >
        <span className="flex items-center gap-2 font-medium">
          {isExpanded ? (
            <ChevronDown size={14} className="text-[#FF2A2A]" />
          ) : (
            <ChevronRight size={14} className="text-[#8A8A92]" />
          )}
          <span className="text-[#E8E8EC] font-semibold">{label}</span>
          <span className="text-[10px] text-[#8A8A92] font-sans">
            ({typeof data === 'object' && data !== null ? `${Object.keys(data as object).length} keys` : typeof data})
          </span>
        </span>

        <span
          onClick={handleCopy}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopy(e as unknown as React.MouseEvent);
            }
          }}
          className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-all ${copied
              ? 'bg-[rgba(192,192,192,0.2)] text-white border-[rgba(192,192,192,0.4)] shadow-[0_0_10px_rgba(192,192,192,0.2)]'
              : 'bg-[rgba(15,15,18,0.7)] text-[#8A8A92] hover:text-white border-[rgba(192,192,192,0.15)] hover:border-[#FF2A2A]/40'
            }`}
          title="Copy JSON to clipboard"
        >
          {copied ? <Check size={12} className="text-white" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </span>
      </button>

      {isExpanded && (
        <pre className="p-3.5 text-[11.5px] font-mono text-[#E8E8EC] overflow-x-auto whitespace-pre leading-relaxed select-text max-h-96 custom-scrollbar bg-[rgba(5,5,6,0.6)]">
          {formattedJson}
        </pre>
      )}
    </div>
  );
};
