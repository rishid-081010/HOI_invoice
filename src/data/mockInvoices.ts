import type { Invoice, N8nSettings } from '../types';

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2041',
    clientName: 'Acme Enterprise Inc',
    clientEmail: 'billing@acme-corp.com',
    clientPhone: '+1 (555) 234-8901',
    contactPerson: 'Sarah Jenkins (VP Finance)',
    amount: 14500,
    currency: '$',
    issueDate: '2026-06-20',
    dueDate: '2026-07-20',
    daysOverdue: 3,
    riskTier: 'VIP',
    status: 'unpaid',
    currentStage: 0,
    paymentTerms: 'Net 30',
    preferredChannel: 'email',
    serviceSummary: 'Q2 Full-Stack Web App Development & Cloud Architecture',
    invoiceItems: [
      { description: 'Frontend React & Node.js Development', amount: 9500 },
      { description: 'AWS Infrastructure & Security Audit', amount: 5000 }
    ],
    followUpHistory: [],
    notes: 'Long-standing enterprise client. Keep tone ultra-polite and executive.'
  },
  {
    id: 'INV-2038',
    clientName: 'Nexus Digital Growth',
    clientEmail: 'accounts@nexusgrowth.io',
    clientPhone: '+1 (555) 876-1234',
    contactPerson: 'Marcus Vance (CEO)',
    amount: 6200,
    currency: '$',
    issueDate: '2026-06-14',
    dueDate: '2026-07-14',
    daysOverdue: 9,
    riskTier: 'Low Risk',
    status: 'reminded_friendly',
    currentStage: 1,
    paymentTerms: 'Net 30',
    preferredChannel: 'whatsapp',
    serviceSummary: 'Monthly Performance Marketing & Lead Generation Retainer',
    invoiceItems: [
      { description: 'Google & Meta Campaign Management', amount: 4500 },
      { description: 'Landing Page Conversion Rate Optimization', amount: 1700 }
    ],
    followUpHistory: [
      {
        id: 'evt-101',
        timestamp: '2026-07-16 09:30 AM',
        stageName: 'Stage 1: Friendly Reminder',
        channel: 'email',
        sender: 'AI Agent',
        subject: 'Friendly Nudge: Invoice #INV-2038 for Nexus Digital Growth',
        content: 'Hi Marcus, just sending a quick gentle reminder regarding Invoice #INV-2038 ($6,200) due on July 14. You can review and settle it with one click here.',
        status: 'opened',
        webhookTriggered: true
      }
    ],
    notes: 'Responds well on WhatsApp. Often pays after 2nd reminder.'
  },
  {
    id: 'INV-2032',
    clientName: 'CyberTech Global',
    clientEmail: 'finance@cybertechglobal.net',
    clientPhone: '+1 (555) 432-9876',
    contactPerson: 'David Miller (Head of Operations)',
    amount: 18800,
    currency: '$',
    issueDate: '2026-06-05',
    dueDate: '2026-07-05',
    daysOverdue: 18,
    riskTier: 'Moderate',
    status: 'reminded_firm',
    currentStage: 2,
    paymentTerms: 'Net 30',
    preferredChannel: 'whatsapp',
    serviceSummary: 'Cybersecurity Penetration Testing & Compliance Report',
    invoiceItems: [
      { description: 'Infrastructure Security Assessment', amount: 12800 },
      { description: 'SOC2 Compliance Documentation', amount: 6000 }
    ],
    followUpHistory: [
      {
        id: 'evt-201',
        timestamp: '2026-07-07 10:00 AM',
        stageName: 'Stage 1: Friendly Reminder',
        channel: 'email',
        sender: 'AI Agent',
        subject: 'Reminder: Overdue Invoice #INV-2032 - CyberTech Global',
        content: 'Dear David, Invoice #INV-2032 ($18,800) reached its due date on July 5. Please find the payment link attached.',
        status: 'delivered'
      },
      {
        id: 'evt-202',
        timestamp: '2026-07-15 02:15 PM',
        stageName: 'Stage 2: Firm Action Notice',
        channel: 'whatsapp',
        sender: 'AI Agent',
        content: '⚠️ Payment Required: Hello David, Invoice #INV-2032 ($18,800) is now 10 days overdue. We offer a 2-part split payment option if needed. Click below to choose your payment option.',
        status: 'delivered',
        webhookTriggered: true
      }
    ],
    notes: 'Offered 50/50 payment split plan to avoid further delay.'
  },
  {
    id: 'INV-2025',
    clientName: 'Apex Retail Group',
    clientEmail: 'ap@apexretailgroup.com',
    clientPhone: '+1 (555) 999-3311',
    contactPerson: 'Elena Rostova (CFO)',
    amount: 24000,
    currency: '$',
    issueDate: '2026-05-22',
    dueDate: '2026-06-21',
    daysOverdue: 32,
    riskTier: 'High Risk',
    status: 'escalated_to_team',
    currentStage: 4,
    paymentTerms: 'Net 30',
    preferredChannel: 'voice_ai',
    serviceSummary: 'Enterprise E-Commerce Platform Overhaul & ERP Integration',
    invoiceItems: [
      { description: 'Shopify Plus Custom Theme & App Architecture', amount: 16000 },
      { description: 'SAP ERP Real-time Inventory Integration', amount: 8000 }
    ],
    followUpHistory: [
      {
        id: 'evt-301',
        timestamp: '2026-06-23 09:00 AM',
        stageName: 'Stage 1: Gentle Nudge',
        channel: 'email',
        sender: 'AI Agent',
        content: 'Reminder regarding invoice #INV-2025.',
        status: 'opened'
      },
      {
        id: 'evt-302',
        timestamp: '2026-07-02 11:30 AM',
        stageName: 'Stage 2: Firm Notice',
        channel: 'whatsapp',
        sender: 'AI Agent',
        content: 'Invoice #INV-2025 is now 11 days overdue. Service freeze warning.',
        status: 'delivered'
      },
      {
        id: 'evt-303',
        timestamp: '2026-07-12 04:00 PM',
        stageName: 'Stage 3: AI Voice Call Attempt',
        channel: 'voice_ai',
        sender: 'AI Agent',
        content: 'Automated AI Collections Call dispatched to +1 (555) 999-3311. Customer requested human callback regarding billing discrepancy.',
        status: 'responded'
      },
      {
        id: 'evt-304',
        timestamp: '2026-07-20 08:45 AM',
        stageName: 'Stage 4: Team Escalation',
        channel: 'slack',
        sender: 'AI Agent',
        subject: '🚨 URGENT: $24,000 Invoice Escalated for Apex Retail Group',
        content: 'Invoice #INV-2025 (32 days overdue) escalated to Senior Account Manager. AI automated sequence paused pending manual call.',
        status: 'sent',
        webhookTriggered: true
      }
    ],
    notes: 'Escalated to Senior AM. Billing dispute flagged on SAP integration line item.'
  },
  {
    id: 'INV-2019',
    clientName: 'BlueWave Media',
    clientEmail: 'billing@bluewave.com',
    clientPhone: '+1 (555) 111-7788',
    contactPerson: 'Oliver Smith (Managing Director)',
    amount: 8500,
    currency: '$',
    issueDate: '2026-06-01',
    dueDate: '2026-07-01',
    daysOverdue: 0,
    riskTier: 'Low Risk',
    status: 'paid',
    currentStage: 1,
    paymentTerms: 'Net 30',
    preferredChannel: 'email',
    serviceSummary: 'Brand Identity Design & Motion Graphics Package',
    invoiceItems: [
      { description: 'Brand Guidelines & Vector Assets', amount: 5000 },
      { description: '3D Motion Product Teaser Video', amount: 3500 }
    ],
    followUpHistory: [
      {
        id: 'evt-401',
        timestamp: '2026-07-02 10:15 AM',
        stageName: 'Stage 1: Gentle Reminder',
        channel: 'email',
        sender: 'AI Agent',
        subject: 'Friendly Nudge: Invoice #INV-2019',
        content: 'Quick note regarding Invoice #INV-2019 ($8,500). Paid immediately via Stripe payment link.',
        status: 'responded',
        webhookTriggered: true
      }
    ],
    notes: 'Paid in full on 1st AI email reminder! Auto-recovered by AI Collections Agent.',
    paymentMethod: 'Stripe Credit Card',
    lastFollowUpDate: '2026-07-02'
  }
];

export const INITIAL_N8N_SETTINGS: N8nSettings = {
  webhookUrl: 'https://primary-production-n8n.up.railway.app/webhook/collections-agent',
  autoTriggerWebhook: true,
  apiKey: '',
  agencyName: 'Nexus AI Agency',
  agencyEmail: 'billing@nexusai.agency',
  defaultChannel: 'email'
};
