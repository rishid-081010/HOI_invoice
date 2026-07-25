/**
 * n8n Tiered Webhook Dispatcher Service
 * Targets n8n Webhook URL: https://rishielevyx.app.n8n.cloud/webhook/d98a9038-029a-498b-b7c3-b870568fd127
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://rishielevyx.app.n8n.cloud/webhook/d98a9038-029a-498b-b7c3-b870568fd127';

/**
 * Triggers n8n webhook with full tiered payload.
 * @param {Object} evaluatedInvoice - Invoice object with stage evaluation data
 * @returns {Promise<Object>} Response result
 */
export async function triggerWebhook(evaluatedInvoice) {
  if (!evaluatedInvoice) {
    throw new Error('Invoice object is required for webhook dispatch');
  }

  const uuid = evaluatedInvoice.id || '';
  const invoiceNum = evaluatedInvoice.invoiceId || '';
  const personName = evaluatedInvoice.contactPerson || evaluatedInvoice.clientName || 'Client';
  const amount = evaluatedInvoice.amount || 0;
  const dueDate = evaluatedInvoice.dueDate || '';
  const paymentLink = evaluatedInvoice.paymentLink || '';
  const clientEmail = evaluatedInvoice.clientEmail || '';
  const stage = evaluatedInvoice.stage || 1;

  let subject = "Reminder about your unpaid invoice";
  let body = `Hey ${personName}, your Invoice ID is ${invoiceNum}. You have an unpaid invoice of ${amount} that was due on ${dueDate}. Kindly pay via ${paymentLink}. Thank you`;

  if (stage === 2) {
    subject = "URGENT: Second Reminder for Unpaid Invoice";
    body = `Hey ${personName}, your Invoice ID is ${invoiceNum}. Your payment of ${amount} was due on ${dueDate} and is now overdue. Please process this payment ASAP to keep your account in good standing. Pay here: ${paymentLink}. Thank you`;
  } else if (stage >= 3) {
    subject = "FINAL NOTICE: Overdue Invoice - Service Cancellation Warning";
    body = `Hey ${personName}, your Invoice ID is ${invoiceNum}. Your invoice of ${amount} was due on ${dueDate} and remains severely overdue. Please be advised that immediate payment is required to avoid cancellation of service. Kindly settle immediately via ${paymentLink}. Thank you`;
  }

  const payload = {
    id: uuid,
    invoiceId: invoiceNum,
    to: clientEmail,
    subject: subject,
    body: body
  };

  try {
    let response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Fallback to webhook-test URL if production URL is inactive or returns 404
    if (!response.ok && N8N_WEBHOOK_URL.includes('/webhook/')) {
      const testUrl = N8N_WEBHOOK_URL.replace('/webhook/', '/webhook-test/');
      console.log(`[webhookService] Production URL returned ${response.status}. Retrying via test URL: ${testUrl}`);
      try {
        const testRes = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (testRes.ok) {
          response = testRes;
        }
      } catch (err) {
        console.warn('[webhookService] Test URL fallback failed:', err.message);
      }
    }

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
