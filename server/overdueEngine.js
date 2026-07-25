/**
 * Overdue Evaluation Engine
 * Handles date parsing (DD-MM-YYYY), days overdue calculation, and stage categorization.
 * 
 * Rules:
 * - Stage 0: <=0 days overdue OR status is 'paid' (Not overdue)
 * - Stage 1: 1-3 days overdue (Friendly reminder)
 * - Stage 2: 4-10 days overdue (Formal reminder)
 * - Stage 3: >10 days overdue / >=11 days (Strict reminder + warning/termination notice)
 */

/**
 * Regex-based DD-MM-YYYY date parser.
 * @param {string} dateStr - Date string in DD-MM-YYYY format
 * @returns {Date|null} Date object at 00:00:00 or null if invalid
 */
export function parseDDMMYYYY(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const str = dateStr.trim();

  // Try DD-MM-YYYY or DD/MM/YYYY
  const matchDDMM = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (matchDDMM) {
    const day = parseInt(matchDDMM[1], 10);
    const month = parseInt(matchDDMM[2], 10) - 1;
    const year = parseInt(matchDDMM[3], 10);
    const date = new Date(year, month, day, 0, 0, 0, 0);
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date;
    }
  }

  // Try YYYY-MM-DD or YYYY/MM/DD
  const matchYYYYMM = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (matchYYYYMM) {
    const year = parseInt(matchYYYYMM[1], 10);
    const month = parseInt(matchYYYYMM[2], 10) - 1;
    const day = parseInt(matchYYYYMM[3], 10);
    const date = new Date(year, month, day, 0, 0, 0, 0);
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date;
    }
  }

  // Fallback for standard ISO strings
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  return null;
}

/**
 * Calculates days overdue between a due date string and a reference date.
 * @param {string} dueDateStr - DD-MM-YYYY date string
 * @param {Date|string} [referenceDate] - Reference date (defaults to today)
 * @returns {number} Integer number of days overdue
 */
export function calculateDaysOverdue(dueDateStr, referenceDate = new Date()) {
  const due = parseDDMMYYYY(dueDateStr);
  if (!due) return 0;

  const ref = referenceDate ? new Date(referenceDate) : new Date();
  ref.setHours(0, 0, 0, 0);

  const diffMs = ref.getTime() - due.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determines stage classification (0, 1, 2, 3) based on days overdue and payment status.
 * @param {number} daysOverdue
 * @param {string} status
 * @returns {Object} Stage details { stage, overdueStage, stageName }
 */
export function categorizeStage(daysOverdue, status = 'unpaid') {
  const isPaid = (status || '').toLowerCase() === 'paid';

  if (isPaid || daysOverdue <= 0) {
    return {
      stage: 0,
      overdueStage: 'Stage 0',
      stageName: 'Stage 0 - Not Overdue'
    };
  }

  if (daysOverdue >= 1 && daysOverdue <= 2) {
    return {
      stage: 1,
      overdueStage: 'Stage 1',
      stageName: 'Stage 1 - First Reminder'
    };
  }

  if (daysOverdue >= 3 && daysOverdue <= 9) {
    return {
      stage: 2,
      overdueStage: 'Stage 2',
      stageName: 'Stage 2 - Second Reminder'
    };
  }

  // daysOverdue >= 10
  return {
    stage: 3,
    overdueStage: 'Stage 3',
    stageName: 'Stage 3 - Third Reminder'
  };
}

/**
 * Evaluates a single invoice object and returns enhanced object with overdue evaluation details.
 * @param {Object} invoice
 * @param {Date|string} [referenceDate]
 * @returns {Object} Evaluated invoice
 */
export function evaluateInvoice(invoice, referenceDate) {
  const daysOverdue = calculateDaysOverdue(invoice.dueDate, referenceDate);
  const stageInfo = categorizeStage(daysOverdue, invoice.status);
  const amountFormatted = typeof invoice.amount === 'number' ? invoice.amount.toFixed(2) : '0.00';

  let emailSubject = `Invoice ${invoice.invoiceId} Notification`;
  let reminderText = `Invoice #${invoice.invoiceId} for $${amountFormatted}`;
  let emailBodyHtml = `<p>Invoice #${invoice.invoiceId} of $${amountFormatted}</p>`;

  switch (stageInfo.stage) {
    case 0:
      emailSubject = `Invoice ${invoice.invoiceId} Status: Current / Paid`;
      reminderText = `Invoice #${invoice.invoiceId} is current or paid. No follow-up needed.`;
      emailBodyHtml = `<p>Thank you for keeping your account up to date. Invoice #${invoice.invoiceId} is current.</p>`;
      break;
    case 1:
      emailSubject = `Friendly Reminder: Invoice ${invoice.invoiceId} Payment Due`;
      reminderText = `Friendly reminder: Your invoice #${invoice.invoiceId} of $${amountFormatted} is ${daysOverdue} day(s) overdue.`;
      emailBodyHtml = `<p>Hi ${invoice.clientName || 'Valued Client'},</p><p>This is a friendly reminder that invoice <strong>#${invoice.invoiceId}</strong> for $${amountFormatted} was due on ${invoice.dueDate} (${daysOverdue} day(s) ago).</p><p>Please use your payment link: <a href="${invoice.paymentLink}">${invoice.paymentLink}</a></p>`;
      break;
    case 2:
      emailSubject = `Second Notice: Outstanding Invoice ${invoice.invoiceId}`;
      reminderText = `Formal notice: Invoice #${invoice.invoiceId} of $${amountFormatted} is now ${daysOverdue} days overdue. Please process payment.`;
      emailBodyHtml = `<p>Dear ${invoice.clientName || 'Finance Team'},</p><p>We have not yet received payment for invoice <strong>#${invoice.invoiceId}</strong> ($${amountFormatted}), which is now <strong>${daysOverdue} days overdue</strong>.</p><p>Please settle this immediately: <a href="${invoice.paymentLink}">${invoice.paymentLink}</a></p>`;
      break;
    case 3:
      emailSubject = `URGENT / FINAL NOTICE: Immediate Payment Required for Invoice ${invoice.invoiceId}`;
      reminderText = `STRICT WARNING / FINAL NOTICE: Invoice #${invoice.invoiceId} of $${amountFormatted} is ${daysOverdue} days overdue. Immediate payment is required to avoid account suspension.`;
      emailBodyHtml = `<p><strong>FINAL NOTICE:</strong> Invoice <strong>#${invoice.invoiceId}</strong> ($${amountFormatted}) is <strong>${daysOverdue} days overdue</strong>.</p><p>Immediate payment is required to avoid service suspension. Payment Link: <a href="${invoice.paymentLink}">${invoice.paymentLink}</a></p>`;
      break;
  }

  return {
    ...invoice,
    dbStage: invoice.stage || 'No reminder',
    daysOverdue,
    overdueStage: stageInfo.overdueStage,
    stage: stageInfo.stage,
    stageName: stageInfo.stageName,
    reminderText,
    emailSubject,
    emailBodyHtml
  };
}

/**
 * Evaluates an array of invoice objects.
 * @param {Array<Object>} invoices
 * @param {Date|string} [referenceDate]
 * @returns {Array<Object>}
 */
export function evaluateInvoices(invoices, referenceDate) {
  if (!Array.isArray(invoices)) return [];
  return invoices.map(inv => evaluateInvoice(inv, referenceDate));
}

export default {
  parseDDMMYYYY,
  calculateDaysOverdue,
  categorizeStage,
  evaluateInvoice,
  evaluateInvoices
};
