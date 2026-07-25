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
 * @param {string} identifier - The internal UUID or human invoice_id
 * @param {Object} updates - { stage: 'first reminder', status: 'reminded_friendly' }
 */
export async function updateInvoiceStage(identifier, updates) {
  if (!identifier) return null;

  const dbUpdates = {};
  if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
  if (updates.status !== undefined) dbUpdates.status = updates.status;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(identifier));
  
  let query = supabase.from('invoices').update(dbUpdates);
  if (isUuid) {
    query = query.eq('id', identifier);
  } else {
    query = query.eq('invoice_id', identifier);
  }

  const { data, error } = await query.select();

  if (error) {
    console.error(`Error updating invoice ${identifier} in Supabase:`, error);
    throw error;
  }

  // If no rows were matched, try the secondary identifier column as a fallback
  if (!data || data.length === 0) {
    const fallbackCol = isUuid ? 'invoice_id' : 'id';
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('invoices')
      .update(dbUpdates)
      .eq(fallbackCol, identifier)
      .select();

    if (fallbackError) {
      console.error(`Fallback update error for ${identifier}:`, fallbackError);
    }
    return fallbackData;
  }

  return data;
}
