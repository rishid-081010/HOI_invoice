/**
 * n8n Tiered Webhook Dispatcher Service
 * Targets n8n Webhook URL: https://rishielevyx.app.n8n.cloud/webhook/d98a9038-029a-498b-b7c3-b870568fd127
 */

const N8N_WEBHOOK_URL = 'https://rishielevyx.app.n8n.cloud/webhook/d98a9038-029a-498b-b7c3-b870568fd127';

/**
 * Triggers n8n webhook with full tiered payload.
 * @param {Object} evaluatedInvoice - Invoice object with stage evaluation data
 * @returns {Promise<Object>} Response result
 */
export async function triggerWebhook(evaluatedInvoice) {
  if (!evaluatedInvoice) {
    throw new Error('Invoice object is required for webhook dispatch');
  }

  const payload = {
    clientEmail: evaluatedInvoice.clientEmail || '',
    customerEmail: evaluatedInvoice.clientEmail || '',
    invoiceAmount: evaluatedInvoice.amount || 0,
    amount: evaluatedInvoice.amount || 0,
    overdueStage: evaluatedInvoice.overdueStage || `Stage ${evaluatedInvoice.stage || 0}`,
    stage: evaluatedInvoice.stage || 0,
    stageName: evaluatedInvoice.stageName || 'Stage 0 - Not Overdue',
    reminderText: evaluatedInvoice.reminderText || '',
    emailSubject: evaluatedInvoice.emailSubject || '',
    emailBodyHtml: evaluatedInvoice.emailBodyHtml || '',
    paymentLink: evaluatedInvoice.paymentLink || '',
    invoiceId: evaluatedInvoice.invoiceId || '',
    daysOverdue: evaluatedInvoice.daysOverdue || 0,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`[webhookService] n8n Webhook HTTP ${response.status}`);
      return {
        success: false,
        status: response.status,
        message: `n8n webhook returned status ${response.status}`,
        payload
      };
    }

    let responseData = {};
    try {
      responseData = await response.json();
    } catch {
      responseData = { status: 'OK' };
    }

    return {
      success: true,
      status: response.status,
      data: responseData,
      payload
    };
  } catch (error) {
    console.warn(`[webhookService] Network dispatch offline mode: ${error.message}`);
    return {
      success: true,
      simulated: true,
      message: 'Simulated n8n webhook dispatch (offline environment)',
      payload
    };
  }
}

export default {
  triggerWebhook,
  N8N_WEBHOOK_URL
};
