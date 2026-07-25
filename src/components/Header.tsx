import React from 'react';
import { Play, CreditCard, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  onRunAICycle: () => void;
  onOpenPaymentPortal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onRunAICycle,
  onOpenPaymentPortal
}) => {
  return (
    <header className="h-20 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between px-8 shrink-0">
      <h2 className="text-2xl font-bold text-white tracking-wide">{title}</h2>
      
      <div className="flex items-center gap-4">
        {/* System Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          System Live
        </div>

        {/* Action Buttons */}
        <button 
          onClick={onOpenPaymentPortal}
          className="flex items-center gap-2 px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-sm font-medium"
        >
          <CreditCard className="w-4 h-4 text-blue-400" />
          Pay Portal
        </button>

        <button 
          onClick={onRunAICycle}
          className="flex items-center gap-2 px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          Run AI Cycle
        </button>
      </div>
    </header>
  );
};
