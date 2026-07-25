import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://reldnmbcyyndqctopmix.supabase.co';
// WARNING: In production, do not hardcode keys. Use environment variables.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbGRubWJjeXluZHFjdG9wbWl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk2MjkyNCwiZXhwIjoyMTAwNTM4OTI0fQ.0Z5nuCWvq8EqQ4cgzKc8cqutQsJGo0-KpD5CZj0o1F4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetches all invoices from Supabase and maps them to our internal structure
 */
export async function fetchInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*');

  if (error) {
    console.error('Error fetching invoices from Supabase:', error);
    throw error;
  }

  // Map database columns to our frontend structure
  return data.map(record => ({
    id: record.id,
    invoiceId: record.invoice_id,
    clientName: record.client_name,
    contactPerson: record.associated_person,
    clientEmail: record.client_email,
    amount: parseFloat(record.amount) || 0,
    dueDate: record.due_date,
    status: record.status || 'unpaid',
    paymentLink: record.payment_link,
    stage: record.stage || 'No reminder',
    createdAt: record.created_at
  }));
}

/**
 * Updates an invoice's stage and status in Supabase
 * @param {string} id - The internal UUID of the invoice record
 * @param {Object} updates - { stage: 'first reminder', status: 'reminded_friendly' }
 */
export async function updateInvoiceStage(id, updates) {
  const dbUpdates = {};
  if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
  if (updates.status !== undefined) dbUpdates.status = updates.status;

  const { data, error } = await supabase
    .from('invoices')
    .update(dbUpdates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating invoice ${id} in Supabase:`, error);
    throw error;
  }
  return data;
}
