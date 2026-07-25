import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Bot,
  MessageSquare,
  Mail,
  PhoneCall,
  List,
  LayoutGrid
} from 'lucide-react';
import type { Invoice, RiskTier } from '../types';

interface InvoiceListProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  activeTab?: string;
  onTriggerSingleFollowUp?: (invoice: Invoice) => void;
  onSimulatePayment?: (invoice: Invoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onSelectInvoice,
  activeTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const filteredInvoices = invoices.filter(inv => {
    return (
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const kanbanColumns = [
    {
      id: 'unpaid',
      title: 'Unpaid / New Invoices',
      colorText: 'text-blue-400',
      pillBg: 'bg-blue-600/30 text-blue-300 border-blue-500/40',
      filterFn: (i: Invoice) => i.status === 'unpaid' && i.currentStage === 0
    },
    {
      id: 'stage1',
      title: '1st Reminder (Friendly)',
      colorText: 'text-cyan-400',
      pillBg: 'bg-cyan-600/30 text-cyan-300 border-cyan-500/40',
      filterFn: (i: Invoice) => i.currentStage === 1 && i.status !== 'paid'
    },
    {
      id: 'stage2',
      title: '2nd Reminder (Firm / Plan)',
      colorText: 'text-amber-400',
      pillBg: 'bg-amber-600/30 text-amber-300 border-amber-500/40',
      filterFn: (i: Invoice) => i.currentStage === 2 && i.status !== 'paid'
    },
    {
      id: 'escalated',
      title: '3rd Reminder / Escalated',
      colorText: 'text-rose-400',
      pillBg: 'bg-rose-600/30 text-rose-300 border-rose-500/40',
      filterFn: (i: Invoice) => (i.currentStage >= 3 || i.status === 'escalated_to_team') && i.status !== 'paid'
    },
    {
      id: 'paid',
      title: 'Recovered / Paid',
      colorText: 'text-emerald-400',
      pillBg: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40',
      filterFn: (i: Invoice) => i.status === 'paid'
    }
  ];

  const visibleColumns = kanbanColumns.filter(col => {
    if (!activeTab || activeTab === 'all' || activeTab === 'crm') return true;
    return col.id === activeTab;
  });

  const getRiskBadgeClass = (risk: RiskTier) => {
    switch (risk) {
      case 'VIP': return 'badge-vip';
      case 'Low Risk': return 'badge-low';
      case 'Moderate': return 'badge-moderate';
      case 'High Risk': return 'badge-high';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageSquare className="w-3 h-3 text-emerald-400" />;
      case 'email': return <Mail className="w-3 h-3 text-cyan-400" />;
      case 'voice_ai': return <PhoneCall className="w-3 h-3 text-purple-400" />;
      default: return <Bot className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Layout Controls */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients, invoice # or contacts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'kanban' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            CRM Pipeline View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'table' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Table View
          </button>
        </div>
      </div>

      {/* KANBAN PIPELINE VIEW (MATCHING USER SCREENSHOT DESIGN) */}
      {viewMode === 'kanban' ? (
        <div className={`grid gap-4 overflow-x-auto pb-4`} style={{ gridTemplateColumns: `repeat(${Math.max(1, visibleColumns.length)}, minmax(280px, 1fr))` }}>
          {visibleColumns.map(col => {
            const columnInvoices = filteredInvoices.filter(col.filterFn);

            return (
              <div key={col.id} className="glass-panel p-3.5 flex flex-col space-y-3 min-w-[240px] bg-slate-950/70 border-slate-800">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className={`font-bold text-xs ${col.colorText} flex items-center gap-1.5`}>
                    {col.title}
                  </h3>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${col.pillBg}`}>
                    {columnInvoices.length}
                  </span>
                </div>

                {/* Column Client Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
                  {columnInvoices.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-600 border border-dashed border-white/5 rounded-xl">
                      No client invoices
                    </div>
                  ) : (
                    columnInvoices.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => onSelectInvoice(inv)}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-500/60 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 space-y-2.5 group relative"
                      >
                        {/* Card Header: Client Name & Date & Action */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-white group-hover:text-cyan-400 transition-colors">
                              {inv.clientName}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">#{inv.id}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                            <span>{inv.issueDate.substring(5)}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); }}
                              className="text-slate-600 hover:text-rose-400 transition-colors p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Amount Highlight */}
                        <div className="text-sm font-extrabold text-blue-400 tracking-wide">
                          {inv.currency}{inv.amount.toLocaleString()}
                        </div>

                        {/* Minimal Metadata Details */}
                        <div className="space-y-1 text-[11px] text-slate-300 border-t border-white/5 pt-2 font-sans">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Contact:</span>
                            <span className="font-medium text-slate-200 truncate max-w-[130px]">{inv.contactPerson.split(' ')[0]}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Risk Tier:</span>
                            <span className={`badge ${getRiskBadgeClass(inv.riskTier)} text-[9px] px-1.5 py-0`}>
                              {inv.riskTier}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-500">Overdue:</span>
                            <span className={`font-semibold ${inv.daysOverdue > 15 ? 'text-rose-400' : 'text-amber-400'}`}>
                              {inv.daysOverdue}d late
                            </span>
                          </div>
                        </div>

                        {/* Card Footer: Channel & Client Email */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1 text-slate-400 font-mono">
                            {getChannelIcon(inv.preferredChannel)}
                            <span className="uppercase">{inv.preferredChannel.replace('_', ' ')}</span>
                          </div>

                          <span className="text-slate-300 font-medium truncate max-w-[150px] font-sans" title={inv.clientEmail}>
                            {inv.status === 'paid' ? (
                              <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">Paid ✓</span>
                            ) : (
                              inv.clientEmail
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW ALTERNATIVE */
        <div className="glass-panel overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Client / Invoice</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Overdue</th>
                  <th className="px-6 py-4">Risk Tier</th>
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInvoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    onClick={() => onSelectInvoice(inv)}
                    className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-white">
                      {inv.clientName} <span className="font-mono text-cyan-400 text-xs">({inv.id})</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">{inv.currency}{inv.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-amber-400 font-semibold">{inv.daysOverdue} days</td>
                    <td className="px-6 py-4"><span className={`badge ${getRiskBadgeClass(inv.riskTier)}`}>{inv.riskTier}</span></td>
                    <td className="px-6 py-4 uppercase font-mono text-slate-400">{inv.preferredChannel}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="btn-secondary text-[11px] px-2.5 py-1">View Full Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
