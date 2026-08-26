import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './button';

interface ErrorAlertProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Failed to load data',
  message = 'Unable to connect to the RecoverAI backend server. Please verify the Spring Boot service is running.',
  onRetry,
}) => {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-red-500/20 text-red-400 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="text-xs text-red-300/80 mt-1 max-w-xl">{message}</p>
        </div>
      </div>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="border-red-500/40 text-red-200 hover:bg-red-500/20 h-8 space-x-1.5 self-start sm:self-auto shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
};
