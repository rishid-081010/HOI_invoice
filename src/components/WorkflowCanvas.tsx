import React, { useState } from 'react';
import { 
  Database, 
  BrainCircuit, 
  Send, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Code, 
  ArrowRight,
  Download,
  Zap
} from 'lucide-react';
import type { N8nSettings } from '../types';

interface WorkflowCanvasProps {
  settings: N8nSettings;
  onDownloadBlueprint: () => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ settings, onDownloadBlueprint }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>('node-3');

  const nodes = [
    {
      id: 'node-1',
      title: '1. Invoice Overdue Detector',
      type: 'Trigger Node',
      icon: Database,
      color: 'from-blue-500 to-indigo-600',
      description: 'Scans Google Sheets & CRM daily for unpaid invoices exceeding grace period.',
      inputPayload: {
        trigger: 'Cron Schedule (Everyday at 09:00 AM)',
        dataSource: 'Google Sheets / QuickBooks CRM',
        query: 'status = unpaid AND dueDate < CURRENT_DATE()'
      },
      outputPayload: {
        overdueCount: 4,
        detectedInvoices: ['INV-2041', 'INV-2038', 'INV-2032', 'INV-2025']
      }
    },
    {
      id: 'node-2',
      title: '2. Risk & Stage Classifier',
      type: 'Logic Node',
      icon: BrainCircuit,
      color: 'from-purple-500 to-pink-600',
      description: 'Evaluates days overdue, payment history, and client risk profile to assign Stage (1 to 4).',
      inputPayload: {
        invoiceId: 'INV-2032',
        daysOverdue: 18,
        previousInvoicesPaidOnTime: 85
      },
      outputPayload: {
        assignedRiskTier: 'Moderate',
        assignedStage: 2,
        recommendedChannel: 'whatsapp',
        offerPaymentPlan: true
      }
    },
    {
      id: 'node-3',
      title: '3. AI Personalization Engine',
      type: 'LLM Node',
      icon: Zap,
      color: 'from-emerald-500 to-teal-600',
      description: 'Generates non-pushy, empathetic, and tailored follow-up copy per channel.',
      inputPayload: {
        model: 'Gemini 3.6 Flash / GPT-4o',
        promptPersona: 'Empathetic B2B Credit Controller',
        variables: { clientName: 'CyberTech Global', amount: '$18,800', daysOverdue: 18 }
      },
      outputPayload: {
        emailSubject: 'Second Notice: Invoice INV-2032 is 18 days overdue',
        whatsAppBody: '⚠️ Payment Required: Invoice INV-2032 ($18,800) is past due. Split payment plan available.',
        toneScore: 'Polite & Structured'
      }
    },
    {
      id: 'node-4',
      title: '4. Multi-Channel Dispatcher',
      type: 'Action Node',
      icon: Send,
      color: 'from-amber-500 to-orange-600',
      description: 'Dispatches message via n8n Gmail node, WhatsApp Business API, or AI Voice call.',
      inputPayload: {
        targetChannel: 'whatsapp',
        recipientPhone: '+1 (555) 432-9876',
        webhookUrl: settings.webhookUrl
      },
      outputPayload: {
        status: 'DISPATCHED_SUCCESSFULLY',
        messageId: 'wa_msg_9823194',
        timestamp: '2026-07-23 20:23:55'
      }
    },
    {
      id: 'node-5',
      title: '5. Response & Payment Listener',
      type: 'Webhook Node',
      icon: MessageSquare,
      color: 'from-cyan-500 to-blue-600',
      description: 'Listens for Stripe payment webhooks or customer WhatsApp replies.',
      inputPayload: {
        listeningFor: ['Stripe payment_intent.succeeded', 'WhatsApp reply: "Paid"', 'WhatsApp reply: "Plan"']
      },
      outputPayload: {
        eventReceived: 'Stripe payment_intent.succeeded',
        paidAmount: 18800,
        invoiceId: 'INV-2032'
      }
    },
    {
      id: 'node-6',
      title: '6. Escalation & Ledger Sync',
      type: 'CRM Node',
      icon: AlertCircle,
      color: 'from-rose-500 to-red-600',
      description: 'Updates invoice status in Google Sheets/CRM; posts Slack alert if Stage 4.',
      inputPayload: {
        action: 'IF stage == 4 THEN Post Slack Alert ELSE Update Google Sheet Status = Paid'
      },
      outputPayload: {
        sheetUpdated: true,
        slackAlertPosted: true,
        auditLogRecorded: true
      }
    }
  ];

  const activeNodeData = nodes.find(n => n.id === selectedNode) || nodes[0];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            n8n / Make Automation Pipeline
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Visual breakdown of the automated collections flow: <span className="text-cyan-400 font-semibold">Detect → Remind → Escalate → Recover ⚡</span>
          </p>
        </div>

        <button 
          onClick={onDownloadBlueprint}
          className="btn-accent text-xs whitespace-nowrap shadow-lg shadow-blue-500/20"
        >
          <Download className="w-4 h-4" />
          Download n8n Blueprint (.json)
        </button>
      </div>

      {/* Node Flow Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`glass-panel p-5 cursor-pointer relative overflow-hidden transition-all ${
                isSelected 
                  ? 'border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]' 
                  : 'hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${node.color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-mono uppercase bg-slate-900/80 px-2 py-1 rounded text-slate-400 border border-white/5">
                  {node.type}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-4">{node.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{node.description}</p>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-cyan-400 font-medium">
                <span>Inspect Node Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              {index < nodes.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-4 h-4 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Node Inspector Drawer */}
      <div className="glass-panel p-6 border-slate-700">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">{activeNodeData.title} Payload Inspector</h3>
              <p className="text-xs text-slate-400">Live JSON schemas passing through n8n execution pipeline</p>
            </div>
          </div>
          <span className="badge badge-low text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for n8n Webhook
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Input Schema */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-300 uppercase">Input Payload (JSON)</span>
              <span className="text-[10px] text-slate-500 font-mono">Incoming Webhook Context</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950/90 text-emerald-400 font-mono text-xs overflow-x-auto border border-white/10 max-h-64">
              {JSON.stringify(activeNodeData.inputPayload, null, 2)}
            </pre>
          </div>

          {/* Output Schema */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-300 uppercase">Output Payload (JSON)</span>
              <span className="text-[10px] text-cyan-400 font-mono">Dispatched Output</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950/90 text-cyan-300 font-mono text-xs overflow-x-auto border border-white/10 max-h-64">
              {JSON.stringify(activeNodeData.outputPayload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
