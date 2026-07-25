import React from 'react';
import { Terminal } from 'lucide-react';
import type { ActivityLog } from '../types';

interface AutomationLogsProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
}

export const AutomationLogs: React.FC<AutomationLogsProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm text-white">Live AI Activity & Webhook Audit Log</h3>
        </div>

        <button 
          onClick={onClearLogs}
          className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors"
        >
          Clear Logs
        </button>
      </div>

      <div className="space-y-2.5 max-h-60 overflow-y-auto font-mono text-xs pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            No activity logs recorded. Click "Run AI Cycle" or trigger actions to observe live execution.
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/90 border border-white/5 text-slate-300">
              <span className="text-[10px] text-slate-500 w-24 shrink-0">{log.timestamp}</span>
              <span className="text-cyan-400 font-bold shrink-0">[{log.invoiceId}]</span>
              <span className="text-slate-200 flex-1 truncate">{log.message}</span>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                {log.type}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
