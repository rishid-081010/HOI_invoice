import React from 'react';
import type { Invoice, ActivityLog } from '../types';
import { AutomationLogs } from './AutomationLogs';

interface DashboardOverviewProps {
  invoices: Invoice[];
  logs: ActivityLog[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ invoices, logs }) => {
  const isPaid = (status?: string) => (status || '').toLowerCase() === 'paid';

  // Total Outstanding = Sum of unpaid invoices ONLY
  const totalOutstanding = invoices
    .filter(i => !isPaid(i.status))
    .reduce((sum, i) => sum + i.amount, 0);

  // AI Recovered Revenue = Sum of paid invoices ONLY
  const totalRecovered = invoices
    .filter(i => isPaid(i.status))
    .reduce((sum, i) => sum + i.amount, 0);

  const activeReminders = invoices.filter(i => !isPaid(i.status) && (i.currentStage === 1 || i.currentStage === 2 || i.currentStage === 3)).length;
  const escalations = invoices.filter(i => !isPaid(i.status) && (i.currentStage >= 3 || i.status === 'escalated_to_team')).length;

  const unpaidCount = invoices.filter(i => !isPaid(i.status) && i.currentStage === 0).length;
  const stage1Count = invoices.filter(i => !isPaid(i.status) && i.currentStage === 1).length;
  const stage2Count = invoices.filter(i => !isPaid(i.status) && i.currentStage === 2).length;
  const paidCount = invoices.filter(i => isPaid(i.status)).length;

  // Upcoming follow-ups for the table
  const upcomingFollowUps = invoices
    .filter(i => !isPaid(i.status) && i.status !== 'escalated_to_team')
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 5);

  const totalVolume = totalRecovered + totalOutstanding;
  const paidPercentage = totalVolume > 0 ? Math.round((totalRecovered / totalVolume) * 100) : 0;
  const unpaidPercentage = 100 - paidPercentage;

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Outstanding</h3>
          <div className="text-3xl font-bold text-white">₹{totalOutstanding.toLocaleString()}</div>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Recovered Revenue</h3>
          <div className="text-3xl font-bold text-emerald-400">₹{totalRecovered.toLocaleString()}</div>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Reminders</h3>
          <div className="text-3xl font-bold text-blue-400">{activeReminders}</div>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Escalated to Team</h3>
          <div className="text-3xl font-bold text-purple-400">{escalations}</div>
        </div>
      </div>

      {/* Invoice Pipeline Stages */}
      <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-medium text-white mb-6">Invoice Pipeline Stages</h3>
        
        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Unpaid</span>
            <span className="text-2xl font-bold text-blue-400">{unpaidCount}</span>
          </div>
          <div className="flex-1 h-[1px] bg-slate-700 mx-4 mt-[-20px]"></div>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">1st Reminder</span>
            <span className="text-2xl font-bold text-cyan-400">{stage1Count}</span>
          </div>
          <div className="flex-1 h-[1px] bg-slate-700 mx-4 mt-[-20px]"></div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">2nd Reminder</span>
            <span className="text-2xl font-bold text-amber-400">{stage2Count}</span>
          </div>
          <div className="flex-1 h-[1px] bg-slate-700 mx-4 mt-[-20px]"></div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Escalated</span>
            <span className="text-2xl font-bold text-rose-400">{escalations}</span>
          </div>
          <div className="flex-1 h-[1px] bg-slate-700 mx-4 mt-[-20px]"></div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Paid</span>
            <span className="text-2xl font-bold text-emerald-400">{paidCount}</span>
          </div>
        </div>
      </div>

      {/* Bottom Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Breakdown Donut Chart */}
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700/50 lg:col-span-1 flex flex-col justify-between">
          <h3 className="text-lg font-medium text-white mb-4">Payment Breakdown</h3>
          
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-amber-500"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${paidPercentage}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              
              <div className="absolute text-center">
                <div className="text-xl font-bold text-white">₹{totalVolume.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400 font-medium">Total Volume</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-mono">Paid</div>
                  <div className="text-sm font-bold text-emerald-400">₹{totalRecovered.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">{paidPercentage}% of total</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-mono">Unpaid</div>
                  <div className="text-sm font-bold text-amber-400">₹{totalOutstanding.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">{unpaidPercentage}% of total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Follow-ups Table */}
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700/50 lg:col-span-2 overflow-hidden flex flex-col">
          <h3 className="text-lg font-medium text-white mb-6">Upcoming Follow-ups</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 border-b border-slate-700/50">
                <tr>
                  <th className="pb-3 font-medium">Client Name</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Overdue</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {upcomingFollowUps.map(inv => (
                  <tr key={inv.id}>
                    <td className="py-4 font-medium text-slate-200">{inv.clientName}</td>
                    <td className="py-4 text-slate-400">{inv.contactPerson.split(' ')[0]}</td>
                    <td className="py-4 text-amber-400">{inv.daysOverdue} days</td>
                    <td className="py-4 text-slate-200">₹{inv.amount.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {inv.currentStage === 0 ? 'Due for 1st Reminder' : `Stage ${inv.currentStage} Active`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Automation Log */}
      <div className="mt-8">
        <AutomationLogs logs={logs} onClearLogs={() => {}} />
      </div>
    </div>
  );
};
