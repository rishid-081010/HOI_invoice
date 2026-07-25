/**
 * Express API Server for Collections Agent
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchInvoices, updateInvoiceStage } from './supabaseService.js';
import { evaluateInvoices, evaluateInvoice } from './overdueEngine.js';
import { triggerWebhook } from './webhookService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

async function getEvaluatedDataset() {
  const rawInvoices = await fetchInvoices();
  return evaluateInvoices(rawInvoices);
}

app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await getEvaluatedDataset();
    res.json(invoices);
  } catch (error) {
    console.error('[server] Error handling GET /api/invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices', message: error.message });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const invoices = await getEvaluatedDataset();
    const totalInvoices = invoices.length;
    const overdueInvoices = invoices.filter(inv => inv.stage > 0);
    const totalOverdue = overdueInvoices.length;
    const totalAmountOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const stageBreakdown = {
      stage0: invoices.filter(i => i.stage === 0).length,
      stage1: invoices.filter(i => i.stage === 1).length,
      stage2: invoices.filter(i => i.stage === 2).length,
      stage3: invoices.filter(i => i.stage === 3).length
    };

    res.json({
      totalInvoices,
      totalOverdue,
      totalAmountOverdue,
      totalAmount,
      stageBreakdown
    });
  } catch (error) {
    console.error('[server] Error handling GET /api/summary:', error);
    res.status(500).json({ error: 'Failed to generate summary', message: error.message });
  }
});

app.post('/api/evaluate', async (req, res) => {
  try {
    const invoices = await getEvaluatedDataset();
    const totalInvoices = invoices.length;
    const overdueInvoices = invoices.filter(inv => inv.stage > 0);
    const totalOverdue = overdueInvoices.length;
    const totalAmountOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const summary = {
      totalInvoices,
      totalOverdue,
      totalAmountOverdue,
      stageBreakdown: {
        stage0: invoices.filter(i => i.stage === 0).length,
        stage1: invoices.filter(i => i.stage === 1).length,
        stage2: invoices.filter(i => i.stage === 2).length,
        stage3: invoices.filter(i => i.stage === 3).length
      }
    };

    res.json({
      evaluatedCount: invoices.length,
      invoices,
      summary
    });
  } catch (error) {
    console.error('[server] Error handling POST /api/evaluate:', error);
    res.status(500).json({ error: 'Failed to evaluate invoices', message: error.message });
  }
});

app.post('/api/trigger-webhook', async (req, res) => {
  try {
    const { invoiceId, invoice } = req.body || {};
    const invoices = await getEvaluatedDataset();

    let target = invoices.find(i => i.invoiceId === invoiceId || i.id === invoiceId);
    if (!target && invoice) {
      target = evaluateInvoice(invoice);
    }

    if (!target) {
      return res.status(404).json({ error: 'Invoice not found', invoiceId });
    }

    const webhookResult = await triggerWebhook(target);
    res.json({
      success: true,
      invoiceId: target.invoiceId,
      result: webhookResult
    });
  } catch (error) {
    console.error('[server] Error handling POST /api/trigger-webhook:', error);
    res.status(500).json({ error: 'Failed to trigger webhook', message: error.message });
  }
});

// --- Core Logic: The Automated Supabase Cycle ---
async function runCycle() {
  console.log('[Cycle] Checking Supabase for overdue invoices...');
  const evaluatedInvoices = await getEvaluatedDataset();
  let triggersFired = 0;

  for (const inv of evaluatedInvoices) {
    // If invoice is paid, ensure stage in Supabase is updated to 'paid'
    if ((inv.status || '').toLowerCase() === 'paid') {
      if ((inv.dbStage || '').toLowerCase() !== 'paid') {
        console.log(`[Cycle] Invoice ${inv.invoiceId} is paid but stage is "${inv.dbStage}". Syncing stage to "paid"...`);
        await updateInvoiceStage(inv.id, { stage: 'paid' });
      }
      continue;
    }

    if (inv.stage === 0) continue; // Not overdue

    let targetStageName = 'No reminder';
    if (inv.stage === 1) targetStageName = 'first reminder';
    if (inv.stage === 2) targetStageName = 'second reminder';
    if (inv.stage === 3) targetStageName = 'third reminder';

    // Compare original database string with target
    if (inv.dbStage.toLowerCase() !== targetStageName.toLowerCase()) {
      console.log(`[Cycle] Stage mismatch for ${inv.invoiceId}. Current: ${inv.dbStage}, Target: ${targetStageName}. Firing webhook...`);
      
      // Fire the webhook to n8n
      const webhookResult = await triggerWebhook(inv);
      
      // Verify n8n returned HTTP 200 success
      if (webhookResult && webhookResult.success) {
        console.log(`[Cycle] Confirmed success response from n8n for Invoice #${inv.invoiceId}. Updating Supabase...`);
        
        // Write the new stage directly to Supabase using the record's UUID
        await updateInvoiceStage(inv.id, { stage: targetStageName });
        
        console.log(`[Cycle] Successfully updated Invoice #${inv.invoiceId} (UUID: ${inv.id}) to "${targetStageName}" in Supabase.`);
        triggersFired++;
      } else {
        console.warn(`[Cycle] Webhook dispatch failed or returned non-success for ${inv.invoiceId}. Supabase stage unchanged.`);
      }
    }
  }
  
  return { evaluated: evaluatedInvoices.length, triggersFired };
}

/**
 * POST /api/run-cycle
 * Manually trigger the full cycle from the dashboard.
 */
app.post('/api/run-cycle', async (req, res) => {
  try {
    const result = await runCycle();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[server] Error handling POST /api/run-cycle:', error);
    res.status(500).json({ error: 'Failed to run cycle', message: error.message });
  }
});

/**
 * POST /api/pay-invoice
 * Marks an invoice as paid in Supabase.
 */
app.post('/api/pay-invoice', async (req, res) => {
  try {
    const { id, invoiceId } = req.body || {};
    const targetId = id || invoiceId;

    if (!targetId) return res.status(400).json({ error: 'Missing invoice id parameter' });

    const result = await updateInvoiceStage(targetId, { status: 'paid', stage: 'paid' });
    console.log(`[server] Invoice ${targetId} successfully marked as PAID in Supabase. Result:`, result);
    res.json({ success: true, message: 'Invoice successfully paid and updated in Supabase.', data: result });
  } catch (error) {
    console.error('[server] Error handling POST /api/pay-invoice:', error);
    res.status(500).json({ error: 'Failed to process payment in Supabase', message: error.message });
  }
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// --- Automated Background Polling for Supabase ---
const POLLING_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

setInterval(async () => {
  try {
    await runCycle();
  } catch (err) {
    console.error('[Automated Poller] Error:', err);
  }
}, POLLING_INTERVAL_MS);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Collections Agent API server listening on http://localhost:${PORT}`);
  });
}

export default app;
