import React from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  DollarSign, 
  Mail, 
  User, 
  Calendar 
} from 'lucide-react';
import type { Invoice } from '../types';

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
  onClose,
  onTriggerFollowUp,
  onSimulatePayment,
  onSendWebhook
}) => {
  const isPaid = (invoice.status || '').toLowerCase() === 'paid';
  const displayId = invoice.invoiceId || invoice.id;
  const paymentPortalUrl = invoice.paymentLink || `${window.location.origin}/payment`;

  // Determine real message payload based on current stage
  let stageName = 'Stage 1 (First Reminder)';
  let subject = 'Reminder about your unpaid invoice';
  let body = `Hey ${invoice.contactPerson || invoice.clientName}, your Invoice ID is ${displayId}. You have an unpaid invoice of ₹${invoice.amount.toLocaleString()} that was due on ${invoice.dueDate}. Kindly pay via ${paymentPortalUrl}. Thank you`;

  if (invoice.currentStage === 2) {
    stageName = 'Stage 2 (Second Reminder)';
    subject = 'URGENT: Second Reminder for Unpaid Invoice';
    body = `Hey ${invoice.contactPerson || invoice.clientName}, your Invoice ID is ${displayId}. Your payment of ₹${invoice.amount.toLocaleString()} was due on ${invoice.dueDate} and is now overdue. Please process this payment ASAP to keep your account in good standing. Pay here: ${paymentPortalUrl}. Thank you`;
  } else if (invoice.currentStage >= 3) {
    stageName = 'Stage 3 (Final Notice)';
    subject = 'FINAL NOTICE: Overdue Invoice - Service Cancellation Warning';
    body = `Hey ${invoice.contactPerson || invoice.clientName}, your Invoice ID is ${displayId}. Your invoice of ₹${invoice.amount.toLocaleString()} was due on ${invoice.dueDate} and remains severely overdue. Please be advised that immediate payment is required to avoid cancellation of service. Kindly settle immediately via ${paymentPortalUrl}. Thank you`;
  }

  const handleDispatch = () => {
    if (onSendWebhook) {
      onSendWebhook(invoice.id);
    } else {
      onTriggerFollowUp(invoice);
    }
  };

  return (
    <div className="modal-overlay p-4 md:p-8 animate-fadeIn flex items-center justify-center">
      <div className="glass-panel w-full max-w-3xl bg-slate-950 border-slate-700 shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-cyan-400 font-mono font-bold text-sm">
              #{displayId}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">{invoice.clientName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isPaid 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {isPaid ? 'Paid & Settled ✓' : `${invoice.daysOverdue} Days Overdue`}
            </span>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 p-5 rounded-2xl border border-white/10 text-xs">
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-mono flex items-center gap-1 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Amount
            </span>
            <div className="text-xl font-extrabold text-emerald-400">
              ₹{invoice.amount.toLocaleString()}
            </div>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-mono flex items-center gap-1 mb-1">
              <User className="w-3.5 h-3.5 text-cyan-400" /> Contact
            </span>
            <div className="text-sm font-semibold text-slate-200">{invoice.contactPerson}</div>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-mono flex items-center gap-1 mb-1">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Email
            </span>
            <div className="text-sm font-semibold text-slate-200 truncate" title={invoice.clientEmail}>{invoice.clientEmail}</div>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-mono flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Due Date
            </span>
            <div className="text-sm font-bold text-amber-400">{invoice.dueDate}</div>
          </div>
        </div>

        {/* Real Email Payload Preview */}
        <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden text-slate-200">
          <div className="bg-slate-950 p-4 border-b border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono w-16">Stage:</span>
              <span className="font-bold text-cyan-400">{isPaid ? 'Paid' : stageName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono w-16">Subject:</span>
              <span className="font-bold text-white">{subject}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono w-16">To:</span>
              <span className="text-slate-300">{invoice.contactPerson} &lt;{invoice.clientEmail}&gt;</span>
            </div>
          </div>

          <div className="p-5 bg-slate-900/90 font-sans space-y-4 text-sm leading-relaxed text-slate-300">
            <p className="whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-xs text-slate-200 leading-relaxed">
              {body}
            </p>

            <div className="pt-1 text-center">
              <a 
                href={paymentPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2"
              >
                Pay ₹{invoice.amount.toLocaleString()} Now via Portal 💳
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          {!isPaid ? (
            <div className="flex items-center gap-3 w-full justify-end">
              <button
                onClick={handleDispatch}
                className="btn-accent text-xs py-2.5 px-4 shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Dispatch n8n Webhook
              </button>
              <button
                onClick={() => onSimulatePayment(invoice)}
                className="btn-primary text-xs py-2.5 px-4 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Paid
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Invoice is fully settled in Supabase
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
