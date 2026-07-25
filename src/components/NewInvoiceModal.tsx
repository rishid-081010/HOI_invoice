import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Invoice, RiskTier, CommunicationChannel } from '../types';

interface NewInvoiceModalProps {
  onClose: () => void;
  onAddInvoice: (invoice: Invoice) => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({ onClose, onAddInvoice }) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone] = useState('+1 (555) 000-1122');
  const [contactPerson, setContactPerson] = useState('');
  const [amount, setAmount] = useState('5000');
  const [daysOverdue, setDaysOverdue] = useState('5');
  const [riskTier, setRiskTier] = useState<RiskTier>('Low Risk');
  const [preferredChannel, setPreferredChannel] = useState<CommunicationChannel>('email');
  const [serviceSummary, setServiceSummary] = useState('Q3 Software Engineering & Consultancy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newInv: Invoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: clientName || 'Starlight Innovations',
      clientEmail: clientEmail || 'billing@starlight.io',
      clientPhone: clientPhone || '+1 (555) 888-9900',
      contactPerson: contactPerson || 'Alex Rivera',
      amount: parseFloat(amount) || 5000,
      currency: '₹',
      issueDate: '2026-06-01',
      dueDate: '2026-07-01',
      daysOverdue: parseInt(daysOverdue) || 5,
      riskTier,
      status: 'unpaid',
      currentStage: 0,
      paymentTerms: 'Net 30',
      preferredChannel,
      serviceSummary,
      invoiceItems: [
        { description: serviceSummary, amount: parseFloat(amount) || 5000 }
      ],
      followUpHistory: [],
      notes: 'Added manually via Command Center.'
    };

    onAddInvoice(newInv);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-lg p-6 border-slate-700 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" /> Add Unpaid Invoice to Detection System
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Client Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Media Corp"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Contact Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Client Email</label>
              <input
                type="email"
                required
                placeholder="e.g. billing@acme.com"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                placeholder="5000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Days Overdue</label>
              <input
                type="number"
                required
                placeholder="5"
                value={daysOverdue}
                onChange={e => setDaysOverdue(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Risk Profile</label>
              <select
                value={riskTier}
                onChange={e => setRiskTier(e.target.value as RiskTier)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white"
              >
                <option value="VIP">VIP Client</option>
                <option value="Low Risk">Low Risk</option>
                <option value="Moderate">Moderate Risk</option>
                <option value="High Risk">High Risk</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Preferred Channel</label>
              <select
                value={preferredChannel}
                onChange={e => setPreferredChannel(e.target.value as CommunicationChannel)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white uppercase"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="voice_ai">Voice AI Call</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Service Description</label>
            <input
              type="text"
              placeholder="e.g. Q3 Full-Stack Web Engineering"
              value={serviceSummary}
              onChange={e => setServiceSummary(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Inject Invoice into AI Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
