import http from 'http';
import app from './server/index.js';
import { triggerWebhook } from './server/webhookService.js';

let server;

async function runTests() {
  console.log('=== STARTING EMPIRICAL VERIFICATION HARNESS ===\n');

  // Start Express server on random high port
  const port = 3099;
  await new Promise((resolve) => {
    server = app.listen(port, () => {
      console.log(`Test server running on port ${port}`);
      resolve();
    });
  });

  const baseUrl = `http://localhost:${port}`;

  const results = {
    endpoints: {},
    n8nPayloadCheck: {},
    n8nWorkflowCompatibility: {}
  };

  // Helper fetch function
  async function makeRequest(path, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`${baseUrl}${path}`, options);
    const status = res.status;
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = await res.text();
    }
    return { status, data };
  }

  // 1. GET /api/invoices
  console.log('--- Testing GET /api/invoices ---');
  try {
    const res = await makeRequest('/api/invoices');
    results.endpoints.getInvoices = {
      status: res.status,
      isArray: Array.isArray(res.data),
      count: Array.isArray(res.data) ? res.data.length : 0,
      sampleItem: Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null
    };
    console.log(`GET /api/invoices -> HTTP ${res.status}, Count: ${results.endpoints.getInvoices.count}`);
    if (results.endpoints.getInvoices.sampleItem) {
      console.log('Sample Invoice:', JSON.stringify(results.endpoints.getInvoices.sampleItem, null, 2));
    }
  } catch (err) {
    console.error('GET /api/invoices failed:', err.message);
    results.endpoints.getInvoices = { error: err.message };
  }

  // 2. GET /api/summary
  console.log('\n--- Testing GET /api/summary ---');
  try {
    const res = await makeRequest('/api/summary');
    results.endpoints.getSummary = {
      status: res.status,
      data: res.data
    };
    console.log(`GET /api/summary -> HTTP ${res.status}`);
    console.log('Summary response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('GET /api/summary failed:', err.message);
    results.endpoints.getSummary = { error: err.message };
  }

  // 3. POST /api/evaluate
  console.log('\n--- Testing POST /api/evaluate ---');
  try {
    const res = await makeRequest('/api/evaluate', 'POST');
    results.endpoints.postEvaluate = {
      status: res.status,
      evaluatedCount: res.data?.evaluatedCount,
      hasSummary: Boolean(res.data?.summary),
      hasInvoices: Array.isArray(res.data?.invoices)
    };
    console.log(`POST /api/evaluate -> HTTP ${res.status}, Count: ${res.data?.evaluatedCount}`);
    console.log('Evaluate summary:', JSON.stringify(res.data?.summary, null, 2));
  } catch (err) {
    console.error('POST /api/evaluate failed:', err.message);
    results.endpoints.postEvaluate = { error: err.message };
  }

  // 4. POST /api/trigger-webhook
  console.log('\n--- Testing POST /api/trigger-webhook ---');
  try {
    // Valid invoice ID
    const resValid = await makeRequest('/api/trigger-webhook', 'POST', { invoiceId: 'INV-1001' });
    console.log(`POST /api/trigger-webhook (INV-1001) -> HTTP ${resValid.status}`);
    console.log('Response:', JSON.stringify(resValid.data, null, 2));

    // Non-existent invoice ID
    const resInvalid = await makeRequest('/api/trigger-webhook', 'POST', { invoiceId: 'NON-EXISTENT-9999' });
    console.log(`POST /api/trigger-webhook (Invalid ID) -> HTTP ${resInvalid.status}`);
    console.log('Response:', JSON.stringify(resInvalid.data, null, 2));

    // Custom invoice object
    const customInvoice = {
      invoiceId: 'INV-CUSTOM-1',
      clientName: 'Custom Client',
      clientEmail: 'custom@example.com',
      amount: 999.99,
      dueDate: '01-01-2025',
      status: 'unpaid',
      paymentLink: 'https://pay.example.com/custom-1'
    };
    const resCustom = await makeRequest('/api/trigger-webhook', 'POST', { invoice: customInvoice });
    console.log(`POST /api/trigger-webhook (Custom Invoice) -> HTTP ${resCustom.status}`);
    console.log('Response:', JSON.stringify(resCustom.data, null, 2));

    results.endpoints.postTriggerWebhook = {
      validStatus: resValid.status,
      validResponse: resValid.data,
      invalidStatus: resInvalid.status,
      invalidResponse: resInvalid.data,
      customStatus: resCustom.status,
      customResponse: resCustom.data
    };
  } catch (err) {
    console.error('POST /api/trigger-webhook failed:', err.message);
    results.endpoints.postTriggerWebhook = { error: err.message };
  }

  // 5. Direct test of n8n payload structure from triggerWebhook
  console.log('\n--- Testing n8n Webhook Payload Structure ---');
  const mockEvaluatedInvoice = {
    invoiceId: 'INV-1001',
    clientName: 'Acme Enterprise Inc',
    clientEmail: 'billing@acmecorp.com',
    amount: 4500.00,
    dueDate: '21-07-2026',
    status: 'unpaid',
    paymentLink: 'https://pay.example.com/inv-1001',
    notes: 'Enterprise SaaS License Q3',
    daysOverdue: 3,
    overdueStage: 'Stage 1',
    stage: 1,
    stageName: 'Stage 1 - Friendly Reminder',
    reminderText: 'Friendly reminder: Your invoice #INV-1001 of $4500.00 is 3 day(s) overdue.',
    emailSubject: 'Friendly Reminder: Invoice INV-1001 Payment Due',
    emailBodyHtml: '<p>Hi Acme Enterprise Inc...</p>'
  };

  const webhookResult = await triggerWebhook(mockEvaluatedInvoice);
  const payload = webhookResult.payload;

  console.log('Generated Webhook Payload:');
  console.log(JSON.stringify(payload, null, 2));

  // Check list of required fields from prompt:
  // clientEmail, customerEmail, invoiceAmount, amount, overdueStage, stage, stageName, reminderText, paymentLink, invoiceId, daysOverdue
  const requiredFields = [
    'clientEmail',
    'customerEmail',
    'invoiceAmount',
    'amount',
    'overdueStage',
    'stage',
    'stageName',
    'reminderText',
    'paymentLink',
    'invoiceId',
    'daysOverdue'
  ];

  const fieldCheck = {};
  for (const field of requiredFields) {
    fieldCheck[field] = {
      present: field in payload,
      value: payload[field],
      type: typeof payload[field]
    };
  }
  console.log('\nRequired Fields Check:');
  console.table(fieldCheck);

  // Check extra workflow requirements from collections_n8n_workflow.json
  const workflowFields = ['clientName', 'slackAlert'];
  const workflowCheck = {};
  for (const field of workflowFields) {
    workflowCheck[field] = {
      present: field in payload,
      value: payload[field]
    };
  }
  console.log('\nN8N Workflow Field Compatibility Check:');
  console.table(workflowCheck);

  server.close(() => {
    console.log('\n=== TEST SERVER CLOSED ===');
  });
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  if (server) server.close();
});
