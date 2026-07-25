import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Bot,
  History,
  Maximize2,
  Minimize2,
  DollarSign,
  Mail,
  User,
  ShieldCheck
} from 'lucide-react';
import type { Invoice, CommunicationChannel } from '../types';
import { getStageDetails } from '../services/aiGenerator';
import { ChannelPreview } from './ChannelPreview';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  agencyName?: string;
  onClose: () => void;
  onTriggerFollowUp: (invoice: Invoice) => void;
  onSimulatePayment: (invoice: Invoice) => void;
  onSendWebhook?: (invoiceId: string, channel?: string) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  agencyName = 'Nexus AI Agency',
  onClose,
  onTriggerFollowUp,
  onSimulatePayment,
  onSendWebhook
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'timeline' | 'items'>('preview');
  const [isFullScreen, setIsFullScreen] = useState(true);

  const stageInfo = getStageDetails(invoice.currentStage);
  const isPaid = invoice.status === 'paid';

  return (
    <div className="modal-overlay p-2 md:p-6 animate-fadeIn">
      <div 
        className={`glass-panel w-full bg-slate-950 border-slate-700 shadow-2xl space-y-6 transition-all duration-300 ${
          isFullScreen ? 'max-w-[98vw] h-[95vh] p-8 overflow-y-auto' : 'max-w-4xl max-h-[90vh] p-6 overflow-y-auto'
        }`}
      >
        {/* Full-Screen Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold font-mono text-cyan-400 text-base">
                {invoice.id}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{invoice.clientName}</h2>
                <span className={`badge ${isPaid ? 'badge-paid' : 'badge-vip'} text-xs px-2.5 py-1`}>
                  {isPaid ? 'Paid & Settled 💸' : invoice.riskTier}
                </span>
                <span className="badge badge-low text-xs">
                  <Bot className="w-3.5 h-3.5" /> AI Agent Assigned
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{invoice.serviceSummary}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-white/10 transition-colors"
              title={isFullScreen ? 'Minimize View' : 'Full Screen View'}
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-900/40 border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Client Metadata Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-900/80 p-5 rounded-2xl border border-white/10 text-xs">
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-mono flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> Invoice Amount
            </span>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">
              {invoice.currency}{invoice.amount.toLocaleString()}
            </div>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-mono flex items-center gap-1">
              <User className="w-3 h-3 text-cyan-400" /> Contact Person
            </span>
            <div className="text-sm font-semibold text-slate-200 mt-1">{invoice.contactPerson}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{invoice.clientPhone}</div>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-mono flex items-center gap-1">
              <Mail className="w-3 h-3 text-blue-400" /> Client Email
            </span>
            <div className="text-sm font-semibold text-slate-200 mt-1 truncate">{invoice.clientEmail}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Terms: {invoice.paymentTerms}</div>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" /> Overdue Status
            </span>
            <div className="text-sm font-bold text-amber-400 mt-1">
              {invoice.daysOverdue} Days Late
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Due: {invoice.dueDate}</div>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-mono flex items-center gap-1">
              <Bot className="w-3 h-3 text-purple-400" /> Current AI Stage
            </span>
            <div className="text-sm font-bold text-cyan-400 mt-1 flex items-center gap-1">
              {stageInfo.name}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${(invoice.currentStage / 4) * 100}%`,
                  backgroundColor: stageInfo.color 
                }}
              />
            </div>
          </div>
        </div>

        {/* Tab Controls & Quick Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`tab-btn text-sm py-2.5 px-4 ${activeTab === 'preview' ? 'active' : ''}`}
            >
              <Sparkles className="w-4 h-4" />
              Multi-Channel AI Generator & Preview
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`tab-btn text-sm py-2.5 px-4 ${activeTab === 'timeline' ? 'active' : ''}`}
            >
              <History className="w-4 h-4" />
              Follow-Up Activity Log ({invoice.followUpHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`tab-btn text-sm py-2.5 px-4 ${activeTab === 'items' ? 'active' : ''}`}
            >
              <FileText className="w-4 h-4" />
              Line Items & CRM Notes
            </button>
          </div>

          {!isPaid && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onTriggerFollowUp(invoice)}
                className="btn-accent text-xs py-2 px-4 shadow-lg shadow-blue-500/20"
              >
                <Send className="w-4 h-4" />
                Dispatch Next AI Stage Reminder
              </button>
              <button
                onClick={() => onSimulatePayment(invoice)}
                className="btn-primary text-xs py-2 px-4 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Invoice Paid
              </button>
            </div>
          )}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'preview' && (
          <div className="pt-2">
            <ChannelPreview 
              invoice={invoice} 
              agencyName={agencyName} 
              onSendWebhook={onSendWebhook ? (channel) => onSendWebhook(invoice.id, channel) : undefined} 
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {invoice.followUpHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-2xl">
                No follow-ups recorded yet. Click "Dispatch Next AI Stage Reminder" to trigger the sequence.
              </div>
            ) : (
              <div className="space-y-3">
                {invoice.followUpHistory.map((evt) => (
                  <div key={evt.id} className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{evt.stageName}</span>
                        <span className="font-mono text-[10px] uppercase bg-slate-950 px-2.5 py-1 rounded-lg text-cyan-400 border border-white/5">
                          {evt.channel}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-slate-500">{evt.timestamp}</span>
                    </div>

                    <p className="text-slate-300 bg-slate-950 p-4 rounded-xl border border-white/5 font-sans leading-relaxed text-sm">
                      {evt.content}
                    </p>

                    {evt.webhookTriggered && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono pt-1">
                        <CheckCircle2 className="w-4 h-4" /> Dispatched via n8n Webhook to Gmail / WhatsApp
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'items' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/10 space-y-4">
              <h4 className="font-bold text-white text-base flex items-center justify-between">
                <span>Invoice Line Items</span>
                <span className="text-xs font-mono text-slate-400">Total: {invoice.currency}{invoice.amount.toLocaleString()}</span>
              </h4>
              <div className="space-y-2.5">
                {invoice.invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-3.5 rounded-xl bg-slate-950 border border-white/5 text-slate-300 text-sm">
                    <span>{item.description}</span>
                    <span className="font-mono font-bold text-white">{invoice.currency}{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/10 space-y-4">
              <h4 className="font-bold text-amber-400 text-base">Internal CRM Notes & Risk Profile</h4>
              <div className="p-4 rounded-xl bg-slate-950 text-slate-300 text-sm leading-relaxed border border-white/5">
                {invoice.notes || 'Standard B2B client contract under automated AI payment monitoring.'}
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 space-y-1">
                <div className="font-semibold text-xs">AI Agent Recommendation:</div>
                <p className="text-slate-400 text-xs">
                  {invoice.daysOverdue > 20 
                    ? 'High overdue balance detected. Offer 2-part weekly payment split plan before escalating to Senior Account Manager call.' 
                    : 'Maintain gentle email & WhatsApp outreach. High likelihood of automated settlement upon next reminder.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
