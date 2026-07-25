/**
 * Google Sheets Backend Service for Collections Agent
 * Fetches and parses CSV data from Google Sheets CRM.
 * Sheet URL: https://docs.google.com/spreadsheets/d/19Fz-qRFjfmwldXyCupjLGOzoS5o0pOZ_NwUnAnIZEXU/gviz/tq?tqx=out:csv
 */

const SPREADSHEET_ID = '19Fz-qRFjfmwldXyCupjLGOzoS5o0pOZ_NwUnAnIZEXU';
const PRIMARY_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;
const SECONDARY_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;

// Offline fallback mock data matching schema
export const MOCK_SHEET_DATA = [
  {
    invoiceId: 'INV-1001',
    clientName: 'Acme Enterprise Inc',
    clientEmail: 'billing@acmecorp.com',
    amount: 4500.00,
    dueDate: '21-07-2026',
    status: 'unpaid',
    paymentLink: 'https://pay.example.com/inv-1001',
    notes: 'Enterprise SaaS License Q3'
  },
  {
    invoiceId: 'INV-1002',
    clientName: 'Nexus Digital Growth',
    clientEmail: 'marcus@nexusgrowth.io',
    amount: 2800.00,
    dueDate: '18-07-2026',
    status: 'unpaid',
    paymentLink: 'https://pay.example.com/inv-1002',
    notes: 'Monthly SEO & PPC Retainer'
  },
  {
    invoiceId: 'INV-1003',
    clientName: 'Vanguard Design Studio',
    clientEmail: 'accounts@vanguardstudio.co',
    amount: 1250.00,
    dueDate: '14-07-2026',
    status: 'unpaid',
    paymentLink: 'https://pay.example.com/inv-1003',
    notes: 'UI/UX System Design Services'
  },
  {
    invoiceId: 'INV-1004',
    clientName: 'Apex Retail Group',
    clientEmail: 'finance@apexretail.com',
    amount: 9400.00,
    dueDate: '22-06-2026',
    status: 'unpaid',
    paymentLink: 'https://pay.example.com/inv-1004',
    notes: 'E-commerce Infrastructure Audit'
  },
  {
    invoiceId: 'INV-1005',
    clientName: 'Starlight Tech Solutions',
    clientEmail: 'devs@starlight.tech',
    amount: 3100.00,
    dueDate: '24-07-2026',
    status: 'unpaid',
    paymentLink: 'https://pay.example.com/inv-1005',
    notes: 'Cloud Migration Consulting'
  },
  {
    invoiceId: 'INV-1006',
    clientName: 'Horizon Logistics',
    clientEmail: 'billing@horizonlogistics.com',
    amount: 5600.00,
    dueDate: '10-07-2026',
    status: 'paid',
    paymentLink: 'https://pay.example.com/inv-1006',
    notes: 'Logistics Dashboard Integration'
  }
];

/**
 * Robust CSV string parser handling quotes, commas, escaped quotes, and newlines.
 * Supports Google Sheets Table format headers.
 * @param {string} csvText
 * @returns {Array<Object>}
 */
export function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentLine.push(currentField.trim());
        if (currentLine.some(f => f.length > 0)) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = '';
        if (char === '\r') i++; // Skip \n in \r\n
      } else if (char !== '\r') {
        currentField += char;
      }
    }
  }

  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    if (currentLine.some(f => f.length > 0)) {
      lines.push(currentLine);
    }
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows = lines.slice(1);

  return rows.map(row => {
    const record = {};
    headers.forEach((header, idx) => {
      let val = row[idx] ? row[idx].replace(/^["']|["']$/g, '').trim() : '';
      record[header] = val;
    });

    const getField = (keys) => {
      for (const k of keys) {
        if (record[k] !== undefined && record[k] !== '') return record[k];
        const found = Object.keys(record).find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (found && record[found] !== undefined && record[found] !== '') return record[found];
      }
      return '';
    };

    let invoiceId = getField(['Invoice ID', 'invoiceId', 'id']);
    const clientName = getField(['Client Name', 'clientName', 'name']);
    const contactPerson = getField(['Associated Person', 'contactPerson', 'Contact Person', 'Person Name']);
    const clientEmail = getField(['Client Email', 'clientEmail', 'email']);
    const rawAmount = getField(['Amount', 'amount']);
    const dueDate = getField(['Due Date', 'dueDate', 'date']);
    const status = getField(['Status', 'status']) || 'unpaid';
    const paymentLink = getField(['Payment Link', 'paymentLink', 'link']);
    const notes = getField(['Notes', 'notes']);

    const amountVal = parseFloat((rawAmount || '0').replace(/[^0-9.-]+/g, '')) || 0;

    if (!invoiceId && clientName) {
      invoiceId = 'INV-' + clientName.replace(/[^A-Za-z0-9]/g, '').substring(0, 5).toUpperCase() + '-' + amountVal;
    }

    return {
      invoiceId,
      clientName,
      contactPerson,
      clientEmail,
      amount: amountVal,
      dueDate,
      status: status.toLowerCase(),
      paymentLink,
      notes
    };
  }).filter(item => Boolean(item.clientName));
}

/**
 * Fetches Google Sheet CSV and parses into array of invoice objects.
 * Falls back to MOCK_SHEET_DATA if fetch fails.
 * @returns {Promise<Array<Object>>}
 */
export async function fetchInvoices() {
  const urls = [PRIMARY_CSV_URL, SECONDARY_CSV_URL];
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn(`[sheetsService] CSV fetch failed for ${url}:`, error.message);
    }
  }
  console.warn('[sheetsService] Could not parse rows from live Google Sheet. Using fallback mock dataset.');
  return MOCK_SHEET_DATA;
}

export default {
  fetchInvoices,
  parseCSV,
  MOCK_SHEET_DATA
};
