import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

import { Sidebar, type MainTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { InvoiceList } from './components/InvoiceList';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { NewInvoiceModal } from './components/NewInvoiceModal';
import { N8nSettingsModal } from './components/N8nSettingsModal';
import { PaymentPortalModal } from './components/PaymentPortalModal';
import { PublicPaymentPage } from './components/PublicPaymentPage';

import type { Invoice, ActivityLog, N8nSettings } from './types';
import { INITIAL_INVOICES, INITIAL_N8N_SETTINGS } from './data/mockInvoices';
import { generateAIMessages } from './services/aiGenerator';
import { fetchInvoices, triggerWebhookApi, runCycleApi } from './services/api';

export function App() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [n8nSettings, setN8nSettings] = useState<N8nSettings>(INITIAL_N8N_SETTINGS);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Sync with backend Google Sheets API on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const fetched = await fetchInvoices();
        if (fetched && fetched.length > 0) {
          setInvoices(fetched);
        }
      } catch (err) {
        console.warn('Backend sync failed on mount:', err);
      }
    }
    loadBackendData();
  }, []);

  // Modal states
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaymentPortalOpen, setIsPaymentPortalOpen] = useState(false);
  const [paymentPortalInvoice, setPaymentPortalInvoice] = useState<Invoice | null>(null);

  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      id: 'log-1',
      timestamp: '2026-07-24 19:20:10',
      invoiceId: 'INV-2041',
      clientName: 'Acme Enterprise Inc',
      type: 'detection',
      message: 'Unpaid invoice detected (3 days overdue). Assigned Risk Tier: VIP.',
      badgeColor: 'cyan'
    },
    {
      id: 'log-2',
      timestamp: '2026-07-24 19:21:05',
      invoiceId: 'INV-2038',
      clientName: 'Nexus Digital Growth',
      type: 'whatsapp_dispatch',
      message: 'Stage 1 Friendly Reminder dispatched via WhatsApp to Marcus Vance (+1 555-876-1234).',
      badgeColor: 'emerald'
    },
    {
      id: 'log-3',
      timestamp: '2026-07-24 19:22:30',
      invoiceId: 'INV-2025',
      clientName: 'Apex Retail Group',
      type: 'slack_escalation',
      message: 'Stage 4 Team Escalation Alert posted to #finance-escalations on Slack (32 days overdue).',
      badgeColor: 'rose'
    }
  ]);

  const addLog = (
    invoiceId: string, 
    clientName: string, 
    type: ActivityLog['type'], 
    message: string, 
    badgeColor: string = 'cyan'
  ) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      invoiceId,
      clientName,
      type,
      message,
      badgeColor
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Run AI Collections Cycle
  const handleRunAICycle = async () => {
    // 1. Hit the backend manual trigger
    const cycleResult = await runCycleApi();
    
    if (cycleResult.success) {
      addLog(
        'SYSTEM',
        'Automated Cycle',
        'ai_generation',
        `Evaluated ${cycleResult.evaluated} invoices. Fired ${cycleResult.triggersFired} new webhooks. Database synchronized.`,
        'cyan'
      );
    } else {
      addLog('SYSTEM', 'Automated Cycle', 'slack_escalation', 'Failed to run backend automated cycle.', 'rose');
    }

    // 2. Fetch the newly updated database state
    const refreshedInvoices = await fetchInvoices();
    if (refreshedInvoices) {
      setInvoices(refreshedInvoices);
    }
  };

  // Simulate Payment Recovery
  const handleSimulatePayment = (inv: Invoice) => {
    setInvoices(prev => prev.map(item => {
      if (item.id === inv.id) {
        return {
          ...item,
          status: 'paid',
          daysOverdue: 0
        };
      }
      return item;
    }));

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    addLog(
      inv.id,
      inv.clientName,
      'payment_received',
      `💳 PAYMENT RECEIVED: ${inv.currency}${inv.amount.toLocaleString()} paid in full! Ledger updated & AI sequence closed.`,
      'emerald'
    );

    if (selectedInvoice && selectedInvoice.id === inv.id) {
      setSelectedInvoice(null);
    }
  };

  // Handle Interactive Payment Matching from Portal
  const handlePaymentSuccess = (invoiceId: string, payerName: string) => {
    const targetInv = invoices.find(i => i.id === invoiceId);

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'paid',
          daysOverdue: 0,
          paymentMethod: 'Stripe Credit Card Portal'
        };
      }
      return inv;
    }));

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });

    if (targetInv) {
      addLog(
        targetInv.id,
        targetInv.clientName,
        'payment_received',
        `💳 PAYMENT MATCH SUCCESSFUL: Payer "${payerName}" submitted ${targetInv.currency}${targetInv.amount.toLocaleString()} via Pay Portal! Stripe payment_intent.succeeded webhook received & ledger synced.`,
        'emerald'
      );
    }

    setIsPaymentPortalOpen(false);
  };

  // Download n8n Blueprint
  const handleDownloadBlueprint = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({
        name: "AI Collections Agent n8n Workflow",
        nodes: [
          { name: "Webhook Trigger", type: "n8n-nodes-base.webhook" },
          { name: "Check Stage", type: "n8n-nodes-base.if" },
          { name: "Gmail Dispatch", type: "n8n-nodes-base.gmail" },
          { name: "Slack Escalation", type: "n8n-nodes-base.slack" },
          { name: "Google Sheet Sync", type: "n8n-nodes-base.googleSheets" }
        ]
      }, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "collections_n8n_workflow.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSendWebhook = async (invoiceId: string, channel?: string) => {
    const targetInvoice = invoices.find(inv => inv.id === invoiceId) || (selectedInvoice?.id === invoiceId ? selectedInvoice : null);
    const invId = targetInvoice ? targetInvoice.id : invoiceId;
    const clientName = targetInvoice ? targetInvoice.clientName : 'Client';
    const dispatchChannel = channel || targetInvoice?.preferredChannel || 'email';

    try {
      const res = await triggerWebhookApi(invId, targetInvoice || undefined);
      addLog(
        invId,
        clientName,
        dispatchChannel === 'whatsapp' ? 'whatsapp_dispatch' : dispatchChannel === 'slack' ? 'slack_escalation' : 'email_dispatch',
        `Dispatched n8n Webhook for ${invId} via ${dispatchChannel}. Status: ${res?.message || 'Success'}`,
        dispatchChannel === 'whatsapp' ? 'emerald' : dispatchChannel === 'slack' ? 'rose' : 'cyan'
      );
    } catch (err) {
      console.error('Error triggering webhook:', err);
      addLog(
        invId,
        clientName,
        'email_dispatch',
        `Failed n8n Webhook dispatch for ${invId}: ${err}`,
        'rose'
      );
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home': return 'Overview';
      case 'all': return 'All Clients';
      case 'stage1': return '1st Reminder';
      case 'stage2': return '2nd Reminder';
      case 'escalated': return 'Escalated Clients';
      case 'workflow': return 'n8n Workflow Canvas';
      case 'settings': return 'Settings';
      default: return 'Overview';
    }
  };

  // Subtab filtering logic for InvoiceList
  const filteredInvoicesBySubtab = invoices.filter(inv => {
    if (activeTab === 'home' || activeTab === 'all') return true;
    if (activeTab === 'stage1') return inv.currentStage === 1 && inv.status !== 'paid';
    if (activeTab === 'stage2') return (inv.currentStage === 2 || inv.currentStage === 3) && inv.status !== 'paid';
    if (activeTab === 'escalated') return inv.status === 'escalated_to_team';
    return true;
  });

  if (window.location.pathname === '/payment') {
    return <PublicPaymentPage />;
  }

  return (
    <div className="flex h-screen bg-[#080c14] text-slate-100 font-sans selection:bg-blue-500 selection:text-white overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a]">
        <Header 
          title={getHeaderTitle()} 
          onRunAICycle={handleRunAICycle}
          onOpenPaymentPortal={() => {
            setPaymentPortalInvoice(null);
            setIsPaymentPortalOpen(true);
          }}
        />

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'home' && (
            <DashboardOverview invoices={invoices} logs={logs} />
          )}

          {['all', 'stage1', 'stage2', 'escalated'].includes(activeTab) && (
            <InvoiceList
              invoices={filteredInvoicesBySubtab}
              onSelectInvoice={setSelectedInvoice}
              activeTab={activeTab}
            />
          )}

          {activeTab === 'workflow' && (
            <WorkflowCanvas
              settings={n8nSettings}
              onDownloadBlueprint={handleDownloadBlueprint}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          agencyName={n8nSettings.agencyName}
          onClose={() => setSelectedInvoice(null)}
          onTriggerFollowUp={() => {
            handleRunAICycle();
          }}
          onSimulatePayment={handleSimulatePayment}
          onSendWebhook={handleSendWebhook}
        />
      )}

      {isNewInvoiceOpen && (
        <NewInvoiceModal
          onClose={() => setIsNewInvoiceOpen(false)}
          onAddInvoice={(inv) => {
            setInvoices(prev => [inv, ...prev]);
            addLog(inv.id, inv.clientName, 'detection', `New invoice injected into AI tracking system ($${inv.amount.toLocaleString()}).`);
          }}
        />
      )}

      {isSettingsOpen && (
        <N8nSettingsModal
          settings={n8nSettings}
          onClose={() => setIsSettingsOpen(false)}
          onSaveSettings={setN8nSettings}
          onDownloadBlueprint={handleDownloadBlueprint}
        />
      )}

      {isPaymentPortalOpen && (
        <PaymentPortalModal
          invoice={paymentPortalInvoice}
          allInvoices={invoices}
          onClose={() => setIsPaymentPortalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default App;
