export type RiskTier = 'VIP' | 'Low Risk' | 'Moderate' | 'High Risk';

export type InvoiceStatus = 
  | 'unpaid' 
  | 'reminded_friendly' 
  | 'reminded_firm' 
  | 'escalated_to_team' 
  | 'paid';

export type FollowUpStage = 0 | 1 | 2 | 3 | 4;

export type CommunicationChannel = 'email' | 'whatsapp' | 'voice_ai' | 'slack';

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface FollowUpEvent {
  id: string;
  timestamp: string;
  stageName: string;
  channel: CommunicationChannel;
  sender: 'AI Agent' | 'Human Finance Manager';
  subject?: string;
  content: string;
  status: 'sent' | 'delivered' | 'opened' | 'responded' | 'failed';
  webhookTriggered?: boolean;
}

export interface Invoice {
  id: string;
  invoiceId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  contactPerson: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  daysOverdue: number;
  riskTier: RiskTier;
  status: InvoiceStatus;
  currentStage: FollowUpStage;
  paymentTerms: string;
  preferredChannel: CommunicationChannel;
  serviceSummary: string;
  invoiceItems: InvoiceItem[];
  followUpHistory: FollowUpEvent[];
  notes?: string;
  lastFollowUpDate?: string;
  paymentMethod?: string;
  discountOffered?: number;
  paymentLink?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  invoiceId: string;
  clientName: string;
  type: 'detection' | 'ai_generation' | 'email_dispatch' | 'whatsapp_dispatch' | 'voice_call' | 'slack_escalation' | 'payment_received';
  message: string;
  badgeColor: string;
}

export interface N8nSettings {
  webhookUrl: string;
  autoTriggerWebhook: boolean;
  apiKey: string;
  agencyName: string;
  agencyEmail: string;
  defaultChannel: CommunicationChannel;
}

export interface GeneratedMessages {
  stage1Friendly: {
    subject: string;
    emailBody: string;
    whatsAppText: string;
    voiceScript: string;
  };
  stage2Reminder: {
    subject: string;
    emailBody: string;
    whatsAppText: string;
    voiceScript: string;
  };
  stage3FirmNotice: {
    subject: string;
    emailBody: string;
    whatsAppText: string;
    voiceScript: string;
  };
  stage4Escalation: {
    subject: string;
    emailBody: string;
    slackAlert: string;
    voiceScript: string;
  };
}
