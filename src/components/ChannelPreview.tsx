import React, { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  Play, 
  Square, 
  CheckCheck,
  Send,
  AlertTriangle
} from 'lucide-react';
import type { Invoice, CommunicationChannel } from '../types';
import { generateAIMessages } from '../services/aiGenerator';

interface ChannelPreviewProps {
  invoice: Invoice;
  agencyName?: string;
  onSendWebhook?: (channel: CommunicationChannel) => void;
}

export const ChannelPreview: React.FC<ChannelPreviewProps> = ({ 
  invoice, 
  agencyName = 'Nexus AI Agency',
  onSendWebhook
}) => {
  const [activeChannel, setActiveChannel] = useState<CommunicationChannel>(invoice.preferredChannel || 'email');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const messages = generateAIMessages(invoice, agencyName);

  const handlePlayVoiceScript = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4">
      {/* Channel Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveChannel('email')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeChannel === 'email' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Preview
          </button>
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeChannel === 'whatsapp' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp View
          </button>
          <button
            onClick={() => setActiveChannel('voice_ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeChannel === 'voice_ai' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            AI Voice Call
          </button>
          <button
            onClick={() => setActiveChannel('slack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeChannel === 'slack' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Slack Team Alert
          </button>
        </div>

        {onSendWebhook && (
          <button
            onClick={() => onSendWebhook(activeChannel)}
            className="btn-accent text-xs py-1.5 px-3"
            title="Send real dispatch payload to n8n Webhook"
          >
            <Send className="w-3.5 h-3.5" />
            Dispatch via n8n Webhook
          </button>
        )}
      </div>

      {/* EMAIL PREVIEW */}
      {activeChannel === 'email' && (
        <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden text-slate-200">
          <div className="bg-slate-950 p-4 border-b border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono w-16">Subject:</span>
              <span className="font-bold text-white">{messages.stage1Friendly.subject}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono w-16">From:</span>
              <span className="text-cyan-400">{agencyName} Accounts &lt;billing@nexusai.agency&gt;</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono w-16">To:</span>
              <span>{invoice.contactPerson} &lt;{invoice.clientEmail}&gt;</span>
            </div>
          </div>

          <div className="p-6 bg-slate-900 font-sans space-y-6 text-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="font-bold text-lg text-white tracking-wider">{agencyName}</div>
              <div className="badge badge-vip">Invoice #{invoice.id}</div>
            </div>

            <div className="whitespace-pre-line leading-relaxed text-slate-300">
              {invoice.currentStage === 0 && messages.stage1Friendly.emailBody}
              {invoice.currentStage === 1 && messages.stage1Friendly.emailBody}
              {invoice.currentStage === 2 && messages.stage2Reminder.emailBody}
              {invoice.currentStage === 3 && messages.stage3FirmNotice.emailBody}
              {invoice.currentStage === 4 && messages.stage4Escalation.emailBody}
            </div>

            {/* Line items summary */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="font-semibold text-slate-400 uppercase tracking-wider mb-2">Invoice Line Items</div>
              {invoice.invoiceItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-300">
                  <span>{item.description}</span>
                  <span className="font-mono font-semibold">{invoice.currency}{item.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm text-white">
                <span>Total Balance Due</span>
                <span className="text-emerald-400">{invoice.currency}{invoice.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 text-center">
              <a 
                href={`https://pay.nexusai.agency/inv/${invoice.id.toLowerCase()}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-sm px-6 py-3 inline-flex"
              >
                Pay ${invoice.amount.toLocaleString()} Now via Secure Portal 💳
              </a>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP PREVIEW */}
      {activeChannel === 'whatsapp' && (
        <div className="max-w-md mx-auto bg-slate-950 rounded-2xl border-4 border-slate-800 p-4 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                AI
              </div>
              <div>
                <div className="font-bold text-white text-xs">{agencyName} Billing Assistant</div>
                <div className="text-[10px] text-emerald-400">Online</div>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{invoice.clientPhone}</span>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-xs space-y-2 text-slate-200">
            <div className="whitespace-pre-line leading-relaxed">
              {invoice.currentStage === 2 ? messages.stage2Reminder.whatsAppText : messages.stage1Friendly.whatsAppText}
            </div>

            <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono pt-1">
              <span>20:23 PM</span>
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>

          {/* WhatsApp Interactive Action Chips */}
          <div className="space-y-2 text-xs">
            <button className="w-full py-2 px-3 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold hover:bg-emerald-600/30 transition-all flex items-center justify-center gap-2">
              💳 Pay {invoice.currency}{invoice.amount.toLocaleString()} Full Amount
            </button>
            <button className="w-full py-2 px-3 rounded-lg bg-slate-900 text-slate-300 border border-white/10 font-medium hover:bg-slate-800 transition-all">
              🤝 Request 2-Part Split Payment Plan
            </button>
          </div>
        </div>
      )}

      {/* VOICE AI CALL PREVIEW */}
      {activeChannel === 'voice_ai' && (
        <div className="glass-panel p-6 border-purple-500/30 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
                <PhoneCall className="w-6 h-6 text-purple-400 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Voice AI Assistant Call Transcript</h4>
                <p className="text-xs text-slate-400">Caller: +1 (800) 555-NEXUS → Target: {invoice.contactPerson} ({invoice.clientPhone})</p>
              </div>
            </div>

            <button
              onClick={() => handlePlayVoiceScript(messages.stage2Reminder.voiceScript)}
              className={`btn-primary px-4 py-2 text-xs ${isPlayingAudio ? 'bg-rose-600 hover:bg-rose-500' : 'bg-purple-600 hover:bg-purple-500'}`}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-4 h-4" /> Stop Audio
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Listen to AI Speech synthesis
                </>
              )}
            </button>
          </div>

          {/* Audio Wave Visualizer */}
          {isPlayingAudio && (
            <div className="flex items-center justify-center gap-1.5 h-8 bg-slate-950 rounded-xl p-2 border border-purple-500/30">
              <div className="audio-bar" />
              <div className="audio-bar" />
              <div className="audio-bar" />
              <div className="audio-bar" />
              <div className="audio-bar" />
              <div className="audio-bar" />
              <span className="text-xs font-mono text-purple-400 ml-2">Synthesizing Speech...</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-purple-200 leading-relaxed">
            "{messages.stage2Reminder.voiceScript}"
          </div>
        </div>
      )}

      {/* SLACK TEAM ALERT PREVIEW */}
      {activeChannel === 'slack' && (
        <div className="bg-slate-950 p-5 rounded-xl border border-rose-500/30 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            #finance-escalations | Team Intervention Alert
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border-l-4 border-rose-500 space-y-3 text-xs text-slate-200">
            <div className="font-bold text-white text-sm">
              🚨 MANUAL COLLECTIONS ESCALATION: {invoice.clientName}
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              <div>Invoice ID: <span className="text-white font-mono">{invoice.id}</span></div>
              <div>Amount: <span className="text-emerald-400 font-bold">{invoice.currency}{invoice.amount.toLocaleString()}</span></div>
              <div>Days Overdue: <span className="text-rose-400 font-bold">{invoice.daysOverdue} days</span></div>
              <div>Risk Profile: <span className="text-purple-400">{invoice.riskTier}</span></div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg text-slate-300">
              Automated AI sequence paused after 3 unresponded dispatches. Please reach out to <span className="text-white font-bold">{invoice.contactPerson}</span> ({invoice.clientPhone}).
            </div>

            <div className="flex gap-2 pt-2">
              <button className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-all text-xs">
                Mark as Paid
              </button>
              <button className="px-3 py-1.5 bg-slate-800 text-slate-200 border border-white/10 font-semibold rounded-lg hover:bg-slate-700 transition-all text-xs">
                Assign to AM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
