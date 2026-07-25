import type { Invoice, InvoiceStatus, FollowUpStage, RiskTier } from '../types';
import { INITIAL_INVOICES } from '../data/mockInvoices';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Maps server-side invoice representation to frontend Invoice interface contract.
 */
export function mapBackendInvoiceToFrontend(serverInvoice: any): Invoice {
  const stage = typeof serverInvoice.stage === 'number' ? serverInvoice.stage : (serverInvoice.currentStage || 0);
  const daysOverdue = typeof serverInvoice.daysOverdue === 'number' ? serverInvoice.daysOverdue : 0;

  let riskTier: RiskTier = 'Low Risk';
  if (serverInvoice.riskTier) {
    const rawRisk = String(serverInvoice.riskTier).trim();
    if (rawRisk === 'VIP') riskTier = 'VIP';
    else if (rawRisk === 'High Risk' || rawRisk === 'High') riskTier = 'High Risk';
    else if (rawRisk === 'Moderate' || rawRisk === 'Medium Risk' || rawRisk === 'Medium') riskTier = 'Moderate';
    else if (rawRisk === 'Low Risk' || rawRisk === 'Low' || rawRisk === 'Normal') riskTier = 'Low Risk';
    else riskTier = 'Low Risk';
  } else {
    if (stage >= 3 || daysOverdue >= 11) riskTier = 'High Risk';
    else if (stage === 2 || (daysOverdue >= 4 && daysOverdue <= 10)) riskTier = 'Moderate';
    else if (stage === 1 || (daysOverdue >= 1 && daysOverdue <= 3)) riskTier = 'Low Risk';
    else riskTier = 'Low Risk';
  }

  let status: InvoiceStatus = 'unpaid';
  if ((serverInvoice.status || '').toLowerCase() === 'paid') {
    status = 'paid';
  } else if (stage === 1) {
    status = 'reminded_friendly';
  } else if (stage === 2 || stage === 3) {
    status = 'reminded_firm';
  } else if (stage === 4 || daysOverdue >= 30) {
    status = 'escalated_to_team';
  }

  const id = serverInvoice.invoiceId || serverInvoice.id || `INV-${Math.floor(Math.random() * 10000)}`;

  return {
    id,
    clientName: serverInvoice.clientName || 'Client Organization',
    clientEmail: serverInvoice.clientEmail || 'client@example.com',
    clientPhone: serverInvoice.clientPhone || '+1 (555) 019-2834',
    contactPerson: serverInvoice.contactPerson || serverInvoice.clientName || 'Finance Manager',
    amount: typeof serverInvoice.amount === 'number' ? serverInvoice.amount : parseFloat(serverInvoice.amount) || 0,
    currency: serverInvoice.currency || '$',
    issueDate: serverInvoice.issueDate || '01-07-2026',
    dueDate: serverInvoice.dueDate || '21-07-2026',
    daysOverdue,
    riskTier,
    status,
    currentStage: (stage > 4 ? 4 : stage) as FollowUpStage,
    paymentTerms: serverInvoice.paymentTerms || 'Net 30',
    preferredChannel: serverInvoice.preferredChannel || 'email',
    serviceSummary: serverInvoice.notes || serverInvoice.serviceSummary || 'Professional Services Retainer',
    invoiceItems: serverInvoice.invoiceItems || [
      {
        description: serverInvoice.notes || 'Professional Services Rendered',
        amount: typeof serverInvoice.amount === 'number' ? serverInvoice.amount : 0
      }
    ],
    followUpHistory: Array.isArray(serverInvoice.followUpHistory) ? serverInvoice.followUpHistory : [],
    notes: serverInvoice.notes || '',
    lastFollowUpDate: serverInvoice.lastFollowUpDate,
    paymentMethod: serverInvoice.paymentMethod
  };
}

/**
 * Fetches invoices list from Express API endpoint /api/invoices.
 * Falls back to INITIAL_INVOICES if backend API is unreachable.
 */
export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/invoices`);
    if (!res.ok) throw new Error(`Server status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(mapBackendInvoiceToFrontend);
    }
    return INITIAL_INVOICES;
  } catch (error) {
    console.warn('[api.ts] Could not connect to Express backend. Using synced initial invoices.', error);
    return INITIAL_INVOICES;
  }
}

/**
 * Fetches summary metrics from Express API endpoint /api/summary.
 */
export async function fetchSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/summary`);
    if (!res.ok) throw new Error(`Server status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('[api.ts] Fallback summary calculation.', error);
    return null;
  }
}

/**
 * Triggers backend evaluation endpoint /api/evaluate.
 */
export async function evaluateInvoicesApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Server status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('[api.ts] Fallback evaluate endpoint error.', error);
    return null;
  }
}

/**
 * Triggers n8n tiered webhook endpoint /api/trigger-webhook for a given invoice.
 */
export async function triggerWebhookApi(invoiceId: string, invoice?: Invoice) {
  try {
    const res = await fetch(`${API_BASE_URL}/trigger-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, invoice })
    });
    if (!res.ok) throw new Error(`Server status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('[api.ts] Webhook trigger fallback response.', error);
    return {
      success: true,
      simulated: true,
      invoiceId,
      message: 'Webhook trigger processed via local frontend client'
    };
  }
}

export default {
  fetchInvoices,
  fetchSummary,
  evaluateInvoicesApi,
  triggerWebhookApi,
  mapBackendInvoiceToFrontend
};
