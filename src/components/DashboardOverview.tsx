import React from 'react';
import type { Invoice, ActivityLog } from '../types';
import { AutomationLogs } from './AutomationLogs';

interface DashboardOverviewProps {
  invoices: Invoice[];
  logs: ActivityLog[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ invoices, logs }) => {
  const totalOutstanding = invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalRecovered = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const activeReminders = invoices.filter(i => (i.currentStage === 1 || i.currentStage === 2 || i.currentStage === 3) && i.status !== 'paid').length;
  const escalations = invoices.filter(i => (i.currentStage >= 3 || i.status === 'escalated_to_team') && i.status !== 'paid').length;

  const unpaidCount = invoices.filter(i => i.status === 'unpaid' && i.currentStage === 0).length;
  const stage1Count = invoices.filter(i => i.currentStage === 1 && i.status !== 'paid').length;
  const stage2Count = invoices.filter(i => i.currentStage === 2 && i.status !== 'paid').length;
  const paidCount = invoices.filter(i => i.status === 'paid').length;

  // Upcoming follow-ups for the table
  const upcomingFollowUps = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'escalated_to_team')
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Outstanding</h3>
          <div className="text-3xl font-bold text-white">${totalOutstanding.toLocaleString()}</div>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Recovered Revenue</h3>
          <div className="text-3xl font-bold text-emerald-400">${totalRecovered.toLocaleString()}</div>
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
        {/* Revenue Sources Donut Chart */}
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700/50 lg:col-span-1">
          <h3 className="text-lg font-medium text-white mb-6">Revenue Sources</h3>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-48 h-48 rounded-full border-[16px] border-[#3b82f6] flex items-center justify-center">
              {/* Fake inner donut ring */}
              <div className="absolute inset-0 rounded-full border-[16px] border-[#10b981] clip-half opacity-80" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}></div>
              <div className="absolute inset-0 rounded-full border-[16px] border-[#f59e0b] clip-half opacity-60" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 50%, 0 50%)' }}></div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{(totalRecovered + totalOutstanding).toLocaleString()}</div>
                <div className="text-xs text-slate-400">Total Volume</div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 rounded bg-[#3b82f6]"></div>
                Stripe
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 rounded bg-[#10b981]"></div>
                Bank Transfer
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 rounded bg-[#f59e0b]"></div>
                PayPal
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
                    <td className="py-4 text-slate-200">${inv.amount.toLocaleString()}</td>
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
