import React, { useState } from 'react';
import { X, Settings, Download, Globe, Zap } from 'lucide-react';
import type { N8nSettings } from '../types';

interface N8nSettingsModalProps {
  settings: N8nSettings;
  onClose: () => void;
  onSaveSettings: (newSettings: N8nSettings) => void;
  onDownloadBlueprint: () => void;
}

export const N8nSettingsModal: React.FC<N8nSettingsModalProps> = ({
  settings,
  onClose,
  onSaveSettings,
  onDownloadBlueprint
}) => {
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl);
  const [autoTrigger, setAutoTrigger] = useState(settings.autoTriggerWebhook);
  const [agencyName, setAgencyName] = useState(settings.agencyName);
  const [agencyEmail, setAgencyEmail] = useState(settings.agencyEmail);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      webhookUrl,
      autoTriggerWebhook: autoTrigger,
      agencyName,
      agencyEmail
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-lg p-6 border-slate-700 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" /> n8n Webhook & Email Settings
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              n8n Webhook URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                placeholder="https://n8n.yourdomain.com/webhook/collections-agent"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white font-mono text-xs"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Paste your n8n POST webhook URL here to trigger real Gmail/WhatsApp dispatches.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Agency Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={e => setAgencyName(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Billing Email</label>
              <input
                type="email"
                value={agencyEmail}
                onChange={e => setAgencyEmail(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-white/10">
            <input
              type="checkbox"
              id="autoTrigger"
              checked={autoTrigger}
              onChange={e => setAutoTrigger(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded"
            />
            <label htmlFor="autoTrigger" className="text-slate-300 font-medium cursor-pointer">
              Automatically trigger n8n Webhook when running AI Collections Cycle
            </label>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-2">
            <div className="font-bold text-cyan-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> n8n Workflow Blueprint</span>
              <button
                type="button"
                onClick={onDownloadBlueprint}
                className="btn-accent text-[11px] py-1 px-3"
              >
                <Download className="w-3.5 h-3.5" /> Download JSON
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">
              Import this JSON blueprint into n8n to instantly get a ready-to-run workflow with Gmail, Google Sheets, and Slack nodes!
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-center font-semibold">
              ✓ Settings Saved Successfully!
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Close
            </button>
            <button type="submit" className="btn-primary text-xs">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
