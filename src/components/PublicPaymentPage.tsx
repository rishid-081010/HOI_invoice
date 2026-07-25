import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchInvoices, payInvoiceApi } from '../services/api';
import type { Invoice } from '../types';

export const PublicPaymentPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchInvoiceId, setSearchInvoiceId] = useState('');
  const [matchedInvoice, setMatchedInvoice] = useState<Invoice | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Load live invoices from backend on mount
    fetchInvoices().then(data => setInvoices(data)).catch(err => console.error('Failed to load invoices:', err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);
    
    const query = searchInvoiceId.toLowerCase().trim();
    // Search by Invoice ID (or internal UUID)
    const match = invoices.find(inv => 
      (inv.id.toLowerCase().trim() === query || (inv.invoiceId && inv.invoiceId.toLowerCase().trim() === query)) &&
      inv.status !== 'paid'
    );
    
    if (match) {
      setMatchedInvoice(match);
    } else {
      setMatchedInvoice(null);
    }
  };

  const handlePay = async () => {
    if (!matchedInvoice) return;
    setIsProcessing(true);

    try {
      // Hit backend API to mark as paid in Supabase
      await payInvoiceApi(matchedInvoice.id);
      
      setIsProcessing(false);
      setIsSuccess(true);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
    }
  };

  if (isSuccess && matchedInvoice) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="glass-panel p-8 max-w-md w-full text-center space-y-4 border border-emerald-500/30 bg-slate-900/80 rounded-xl shadow-2xl">
          <div className="mx-auto w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
          <p className="text-slate-400">
            Thank you! Your payment for Invoice <strong className="text-white">#{matchedInvoice.invoiceId || matchedInvoice.id}</strong> ({matchedInvoice.clientName}) of <strong className="text-white">${matchedInvoice.amount.toLocaleString()}</strong> has been processed.
          </p>
          <div className="pt-2 text-xs text-emerald-400 font-medium">
            ✓ Status updated to "paid" in Supabase
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-4 font-sans text-slate-100 selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg glass-panel p-8 border border-slate-800 bg-slate-900/80 rounded-2xl shadow-2xl z-10">
        <div className="flex items-center gap-3 justify-center mb-8 pb-6 border-b border-white/5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Secure Payment Portal</h1>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              256-Bit SSL Encrypted
            </p>
          </div>
        </div>

        {!matchedInvoice ? (
          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enter your Invoice ID to locate your pending invoice:
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={searchInvoiceId}
                  onChange={(e) => {
                    setSearchInvoiceId(e.target.value);
                    setSearchAttempted(false);
                  }}
                  placeholder="e.g. INV-2041 or INV-001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            
            {searchAttempted && !matchedInvoice && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-300">
                  We couldn't find an unpaid invoice matching <strong>"{searchInvoiceId}"</strong>. Please verify your Invoice ID and try again.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
            >
              Locate Pending Invoice
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Invoice ID</span>
                <span className="font-mono text-white font-semibold">{matchedInvoice.invoiceId || matchedInvoice.id}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Company Name</span>
                <span className="font-semibold text-white">{matchedInvoice.clientName}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Contact Person</span>
                <span className="text-slate-300">{matchedInvoice.contactPerson}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 text-sm">Amount Due</span>
                <span className="text-2xl font-bold text-white">${matchedInvoice.amount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className={`w-full text-white font-medium py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                isProcessing 
                  ? 'bg-blue-800 cursor-not-allowed opacity-80' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 active:scale-[0.98]'
              }`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              {isProcessing ? 'Processing Secure Payment...' : `Pay $${matchedInvoice.amount.toLocaleString()} Now`}
            </button>

            <button
              onClick={() => {
                setMatchedInvoice(null);
                setSearchAttempted(false);
              }}
              className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Search a different Invoice ID
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
