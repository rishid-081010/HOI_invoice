import type { Invoice, FollowUpStage, GeneratedMessages } from '../types';

export function generateAIMessages(invoice: Invoice, agencyName: string = 'Nexus AI Agency'): GeneratedMessages {
  const formattedAmount = `${invoice.currency}${invoice.amount.toLocaleString()}`;
  const paymentLink = `https://pay.nexusai.agency/inv/${invoice.id.toLowerCase()}`;
  
  // Stage 1: Gentle Nudge (1-5 Days Overdue)
  const stage1Friendly = {
    subject: `Gentle Reminder: Invoice ${invoice.id} for ${invoice.clientName}`,
    emailBody: `Hi ${invoice.contactPerson.split(' ')[0]},\n\nHope you're having a great week!\n\nThis is a quick gentle note from the accounts team at ${agencyName}. We noticed that Invoice ${invoice.id} for ${formattedAmount} (covering ${invoice.serviceSummary}) was due on ${invoice.dueDate}.\n\nWe know how busy things get! You can easily review the invoice and complete payment using your preferred payment method here:\n👉 ${paymentLink}\n\nIf payment has already been processed in the last 24 hours, please disregard this note. If you have any questions, feel free to reply directly to this email.\n\nWarm regards,\nAI Collections Assistant | ${agencyName}`,
    whatsAppText: `👋 Hi ${invoice.contactPerson.split(' ')[0]}! Quick gentle nudge from ${agencyName}. Invoice *${invoice.id}* (${formattedAmount}) reached its due date on ${invoice.dueDate}.\n\nClick below to view & settle with 1 click:\n🔗 ${paymentLink}\n\nLet us know if you need anything! 😊`,
    voiceScript: `Hello ${invoice.contactPerson.split(' ')[0]}, this is Alex calling from ${agencyName}'s finance department. I am reaching out regarding invoice ${invoice.id} for ${formattedAmount}, which was due on ${invoice.dueDate}. We value our partnership with ${invoice.clientName} and wanted to ensure you received the invoice link. You can complete the payment online at ${paymentLink} or let us know if you need any assistance.`
  };

  // Stage 2: Official Reminder & Payment Plan Offer (6-15 Days Overdue)
  const stage2Reminder = {
    subject: `Second Notice: Invoice ${invoice.id} is ${invoice.daysOverdue} days overdue (${formattedAmount})`,
    emailBody: `Dear ${invoice.contactPerson},\n\nWe are writing to follow up on Invoice ${invoice.id} in the amount of ${formattedAmount}, which is now ${invoice.daysOverdue} days overdue.\n\nDetails:\n- Invoice ID: ${invoice.id}\n- Amount Due: ${formattedAmount}\n- Due Date: ${invoice.dueDate}\n- Services: ${invoice.serviceSummary}\n\nTo help maintain smooth continuity for your account, please settle this balance at your earliest convenience:\n💳 Secure Payment Link: ${paymentLink}\n\n💡 *Flexible Option*: If ${invoice.clientName} is currently experiencing a cash flow delay, we can structure a 2-part weekly payment plan for this balance. Reply to this email or click the link to select a payment schedule.\n\nThank you for your prompt attention to this matter.\n\nSincerely,\nFinance Operations | ${agencyName}`,
    whatsAppText: `⚠️ *Overdue Invoice Notice*: Hi ${invoice.contactPerson.split(' ')[0]}, Invoice *${invoice.id}* (${formattedAmount}) is now *${invoice.daysOverdue} days overdue*.\n\nPlease choose an option below:\n1️⃣ Pay full amount: ${paymentLink}\n2️⃣ Request 2-part weekly payment plan\n3️⃣ Reply 'CALL' to speak with billing.\n\nThank you!`,
    voiceScript: `Hello ${invoice.contactPerson}, this is an automated follow-up call from ${agencyName}. Our records show that Invoice ${invoice.id} for ${formattedAmount} is currently ${invoice.daysOverdue} days overdue. We have sent a secure payment link via SMS and email. If you need to discuss flexible payment terms or split payments, press 1 now or reply to our WhatsApp message.`
  };

  // Stage 3: Firm Action Required & Service Freeze Warning (16-30 Days Overdue)
  const stage3FirmNotice = {
    subject: `URGENT ACTION REQUIRED: Overdue Balance Invoice ${invoice.id} (${formattedAmount})`,
    emailBody: `ATTENTION: ${invoice.contactPerson.toUpperCase()} / ${invoice.clientName.toUpperCase()}\n\nDespite previous reminders, Invoice ${invoice.id} for ${formattedAmount} remains outstanding and is now ${invoice.daysOverdue} days overdue.\n\nContinued delay of this payment may result in a temporary pause of active retainers and ongoing project support. We strongly urge you to resolve this immediately to avoid service interruption.\n\n🔴 Pay Now Immediately: ${paymentLink}\n\nIf you require immediate assistance or need to discuss an emergency payment plan, please contact our finance hotline immediately at billing@nexusai.agency.\n\nRegards,\nCredit Control Department | ${agencyName}`,
    whatsAppText: `🔴 *URGENT*: Hello ${invoice.contactPerson.split(' ')[0]}, Invoice *${invoice.id}* (${formattedAmount}) is now *${invoice.daysOverdue} days overdue*.\n\nTo prevent account suspension and service hold, please complete settlement immediately:\n👉 ${paymentLink}\n\nIf you have already paid, send receipt proof here.`,
    voiceScript: `Urgent message for ${invoice.contactPerson} at ${invoice.clientName}. Invoice ${invoice.id} for ${formattedAmount} is now ${invoice.daysOverdue} days past due. To prevent service suspension, please complete payment immediately via the secure link sent to your email or contact our accounts team.`
  };

  // Stage 4: Team Escalation & Human Intervention Trigger (30+ Days Overdue)
  const stage4Escalation = {
    subject: `🚨 MANUAL ESCALATION REQUIRED: ${invoice.clientName} (${formattedAmount} - ${invoice.daysOverdue} Days Overdue)`,
    emailBody: `INTERNAL TEAM ALERT: Invoice ${invoice.id} for ${invoice.clientName} has reached 30+ days overdue without payment.\n\nAutomated AI follow-up sequences have been paused. Manual human intervention (Account Executive phone call or executive outreach) is required.\n\nCustomer Details:\n- Client: ${invoice.clientName}\n- Contact: ${invoice.contactPerson} (${invoice.clientPhone})\n- Risk Tier: ${invoice.riskTier}\n- Total Outstanding: ${formattedAmount}\n- Days Overdue: ${invoice.daysOverdue}`,
    slackAlert: `🚨 *MANUAL COLLECTIONS ESCALATION*\n• *Client*: ${invoice.clientName}\n• *Invoice ID*: ${invoice.id}\n• *Amount*: *${formattedAmount}*\n• *Days Overdue*: *${invoice.daysOverdue} days* (Risk: ${invoice.riskTier})\n• *Primary Contact*: ${invoice.contactPerson} (${invoice.clientPhone})\n• *AI Action*: Automated sequence paused. Senior AM call required.\n\n<${paymentLink}|View Invoice in CRM> | <slack://user?id=am|Assign to Account Manager>`,
    voiceScript: `Human escalation alert triggered for ${invoice.clientName}. Senior account manager notification dispatched.`
  };

  return {
    stage1Friendly,
    stage2Reminder,
    stage3FirmNotice,
    stage4Escalation
  };
}

export function getStageDetails(stage: FollowUpStage) {
  switch (stage) {
    case 0:
      return { name: 'Unpaid / Detection', color: '#94a3b8', badge: 'Pending Follow-up' };
    case 1:
      return { name: 'Stage 1: Gentle Nudge', color: '#38bdf8', badge: 'Friendly Reminder' };
    case 2:
      return { name: 'Stage 2: Official Notice', color: '#fbbf24', badge: 'Polite Follow-up' };
    case 3:
      return { name: 'Stage 3: Firm Action', color: '#f97316', badge: 'Firm Notice' };
    case 4:
      return { name: 'Stage 4: Team Escalation', color: '#ef4444', badge: 'Escalated to Human' };
    default:
      return { name: 'Unpaid', color: '#94a3b8', badge: 'Pending' };
  }
}
