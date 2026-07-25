import React from 'react';
import { CreditCard, RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  onRunAICycle: () => void;
  onOpenPaymentPortal: () => void;
  isRunningCycle?: boolean;
  aiProvider?: 'gemini' | 'ollama' | 'template';
  onChangeAiProvider?: (provider: 'gemini' | 'ollama' | 'template') => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onRunAICycle,
  onOpenPaymentPortal,
  isRunningCycle = false,
  aiProvider = 'gemini',
  onChangeAiProvider
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

        {/* AI Engine Selector */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-medium text-slate-400 hidden md:inline">AI Engine:</span>
          <select 
            value={aiProvider} 
            onChange={(e) => onChangeAiProvider?.(e.target.value as any)}
            className="bg-transparent text-cyan-400 font-bold outline-none cursor-pointer text-xs"
          >
            <option value="gemini" className="bg-slate-900 text-cyan-400">✨ Gemini 2.5 Flash</option>
            <option value="ollama" className="bg-slate-900 text-purple-400">🦙 Local Ollama</option>
            <option value="template" className="bg-slate-900 text-slate-300">⚡ Static Engine</option>
          </select>
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
          disabled={isRunningCycle}
          className={`flex items-center gap-2 px-4 py-2 rounded border border-slate-700 transition-colors text-sm font-medium ${
            isRunningCycle 
              ? 'bg-blue-900/50 text-blue-300 cursor-not-allowed border-blue-500/50' 
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-[0.98]'
          }`}
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRunningCycle ? 'animate-spin' : ''}`} />
          {isRunningCycle ? 'Scanning Supabase...' : 'Run AI Cycle'}
        </button>
      </div>
    </header>
  );
};
