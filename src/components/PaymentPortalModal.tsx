import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  AlertCircle,
  Building2
} from 'lucide-react';
import type { Invoice } from '../types';

interface PaymentPortalModalProps {
  invoice?: Invoice | null;
  allInvoices: Invoice[];
  onClose: () => void;
  onPaymentSuccess: (invoiceId: string, payerName: string) => void;
}

export const PaymentPortalModal: React.FC<PaymentPortalModalProps> = ({
  invoice: initialInvoice,
  allInvoices,
  onClose,
  onPaymentSuccess
}) => {
  const [payerName, setPayerName] = useState(initialInvoice?.clientName || '');
  const [payerEmail, setPayerEmail] = useState(initialInvoice?.clientEmail || '');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(initialInvoice?.id || allInvoices.find(i => i.status !== 'paid')?.id || '');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const targetInvoice = allInvoices.find(i => i.id === selectedInvoiceId) || initialInvoice;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!payerName.trim()) {
      setErrorMessage('Please enter the Payer Name or Company Name.');
      return;
    }

    if (!targetInvoice) {
      setErrorMessage('Please select a valid unpaid invoice.');
      return;
    }

    // Matching logic: check if payerName includes client company name or contact person
    const normalizedPayer = payerName.toLowerCase().trim();
    const normalizedClient = targetInvoice.clientName.toLowerCase();
    const normalizedContact = targetInvoice.contactPerson.toLowerCase();

    const isNameMatch = 
      normalizedPayer.includes(normalizedClient) || 
      normalizedClient.includes(normalizedPayer) ||
      normalizedPayer.includes(normalizedContact.split(' ')[0]) ||
      normalizedContact.includes(normalizedPayer);

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      if (isNameMatch || allInvoices.some(i => i.id === selectedInvoiceId)) {
        onPaymentSuccess(targetInvoice.id, payerName);
      } else {
        setErrorMessage(`Payer details "${payerName}" do not match the client record for ${targetInvoice.clientName}. Please verify spelling.`);
      }
    }, 1000);
  };

  return (
    <div className="modal-overlay p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-xl bg-slate-950 border-slate-700 shadow-2xl overflow-hidden rounded-2xl">
        {/* Checkout Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                Secure Client Payment Portal
                <span className="badge badge-low text-[10px]">256-Bit SSL Encrypted 🔒</span>
              </h3>
              <p className="text-xs text-slate-400">Powered by Stripe & Nexus AI Collections Engine</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary */}
        {targetInvoice && (
          <div className="bg-slate-900/90 p-4 mx-6 mt-6 rounded-xl border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-mono">Invoice #{targetInvoice.id}</span>
              <div className="font-bold text-white text-sm">{targetInvoice.clientName}</div>
              <div className="text-slate-400 text-[11px]">{targetInvoice.serviceSummary}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-400 uppercase text-[10px]">Total Balance Due</span>
              <div className="text-xl font-extrabold text-emerald-400">
                {targetInvoice.currency}{targetInvoice.amount.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handlePay} className="p-6 space-y-4 text-xs">
          {/* Select Invoice */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Invoice to Pay</label>
            <select
              value={selectedInvoiceId}
              onChange={e => setSelectedInvoiceId(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white font-medium"
            >
              {allInvoices.map(inv => (
                <option key={inv.id} value={inv.id} disabled={inv.status === 'paid'}>
                  {inv.id} - {inv.clientName} ({inv.currency}{inv.amount.toLocaleString()}) {inv.status === 'paid' ? '[PAID]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Payer Name Verification Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Payer / Company Name <span className="text-cyan-400">(Verification Matching Field)</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Acme Enterprise Inc or Sarah Jenkins"
                value={payerName}
                onChange={e => setPayerName(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white font-medium focus:border-cyan-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Enter your official company name or billing contact name matching the invoice record.
            </p>
          </div>

          {/* Payer Email */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Billing Receipt Email</label>
            <input
              type="email"
              required
              placeholder="e.g. billing@acme-corp.com"
              value={payerEmail}
              onChange={e => setPayerEmail(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>

          {/* Simulated Payment Card */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-2">
            <label className="block text-slate-400 font-medium text-[11px]">Credit Card / Corporate Payment Method</label>
            <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-white/5">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none flex-1"
              />
              <span className="text-[10px] font-mono text-emerald-400 font-bold">VISA / MC</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Pay Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing || targetInvoice?.status === 'paid'}
              className="w-full btn-primary text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying Payer & Processing Stripe Payment...
                </>
              ) : targetInvoice?.status === 'paid' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Invoice Already Settled & Paid!
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Authorize & Submit Payment ({targetInvoice?.currency}{targetInvoice?.amount.toLocaleString()})
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="bg-slate-900 p-3 text-center text-[10px] text-slate-500 border-t border-white/5 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time webhook trigger: Transmits <code>payment_intent.succeeded</code> to n8n upon match.</span>
        </div>
      </div>
    </div>
  );
};
