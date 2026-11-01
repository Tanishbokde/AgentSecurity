import React from 'react';
import { AlertCircle, RefreshCw, FolderSearch } from 'lucide-react';
import { Button } from './Button';

export const ErrorCard: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-2xl bg-[rgba(139,0,0,0.18)] border border-[#E10600]/40 text-left shadow-[0_0_25px_rgba(225,6,0,0.25)] backdrop-blur-md ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-[#FF2A2A] shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#FF2A2A] uppercase tracking-wider font-display">{title}</h4>
          <p className="text-xs text-[#E8E8EC]/90 mt-1 leading-relaxed">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="danger"
                size="sm"
                onClick={onRetry}
                leftIcon={<RefreshCw size={12} />}
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}> = ({
  title = 'No records found',
  description = 'No evaluation telemetry or runs recorded for this criteria yet.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center rounded-2xl glass-card border border-[rgba(192,192,192,0.12)] flex flex-col items-center justify-center ${className}`}>
      <div className="p-3.5 bg-[rgba(225,6,0,0.08)] border border-[#FF2A2A]/25 rounded-xl text-[#FF2A2A] mb-3 shadow-[0_0_15px_rgba(225,6,0,0.2)]">
        <FolderSearch size={26} />
      </div>
      <h4 className="text-sm font-bold text-[#E8E8EC] uppercase tracking-wider font-display mb-1">{title}</h4>
      <p className="text-xs text-[#8A8A92] max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{
  rows?: number;
  className?: string;
}> = ({ rows = 4, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 skeleton-shimmer rounded-lg border border-white/[0.04] w-full" />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4 ${className}`}>
      <div className="h-5 skeleton-shimmer rounded w-1/3" />
      <div className="h-8 skeleton-shimmer rounded w-1/2" />
      <div className="h-4 skeleton-shimmer rounded w-2/3" />
    </div>
  );
};
