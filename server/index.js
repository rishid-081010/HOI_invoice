/**
 * Express API Server for Collections Agent
 * 
 * Endpoints:
 * - GET /api/invoices
 * - GET /api/summary
 * - POST /api/evaluate
 * - POST /api/trigger-webhook
 */

import express from 'express';
import cors from 'cors';
import { fetchInvoices } from './sheetsService.js';
import { evaluateInvoices, evaluateInvoice } from './overdueEngine.js';
import { triggerWebhook } from './webhookService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * Helper to fetch and evaluate current Google Sheets CRM dataset.
 */
async function getEvaluatedDataset() {
  const rawInvoices = await fetchInvoices();
  return evaluateInvoices(rawInvoices);
}

/**
 * GET /api/invoices
 * Returns list of synced invoices from Google Sheet with overdue stage details.
 */
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await getEvaluatedDataset();
    res.json(invoices);
  } catch (error) {
    console.error('[server] Error handling GET /api/invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices', message: error.message });
  }
});

/**
 * GET /api/summary
 * Returns metrics summary (total invoices, total overdue, stage breakdown).
 */
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

/**
 * POST /api/evaluate
 * Executes overdue invoice evaluation and returns classified stages.
 */
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

/**
 * POST /api/trigger-webhook
 * Body: { invoiceId } -> Triggers n8n webhook for specified invoice.
 */
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Collections Agent API server listening on http://localhost:${PORT}`);
  });
}

export default app;
