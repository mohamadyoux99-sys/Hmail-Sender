import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  Play,
  Pause,
  Square,
  Eye,
  Code,
  Server,
  Users,
  Sparkles,
  Clock,
  Sliders,
  CheckCircle2,
  Upload,
  FileText,
  Radio,
  Loader2
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Campaign } from '../types';

export const BulkSender: React.FC = () => {
  const { t } = useTranslation();
  const {
    smtps,
    campaigns,
    lists,
    terminalLogs,
    clearTerminalLogs,
    isWsConnected,
    isDispatching,
    dispatchProgress,
    startDispatch,
    stopDispatch,
    showToast,
    setActiveTab,
  } = useApp();

  const [subject, setSubject] = useState('{Hi|Hello} {{name}}, important update regarding {{company}}');
  const [senderName, setSenderName] = useState('Alex Rivers | GrowthCorp');
  const [fromEmail, setFromEmail] = useState(smtps[0]?.fromEmail || 'alex@growthcorp.com');
  const [replyTo, setReplyTo] = useState('alex@growthcorp.com');
  const [bodyHtml, setBodyHtml] = useState(
`<div style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px;">
  <h2>Hello {{name}},</h2>
  <p>{Hope you are having a productive week!|Reaching out with an exclusive invitation for {{company}}.}</p>
  <p>We launched HMailInbox v1.0 with real-time SMTP clustering and WebSocket deliverability tracking.</p>
  <p><a href="http://localhost:3001/api/tracking/click/camp-1/{{email}}?url=https://example.com" style="display:inline-block; padding:10px 20px; background:#a855f7; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">View Live Demonstration</a></p>
  <br>
  <p>Best regards,<br><b>The HMailInbox Team</b></p>
</div>`
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [enableTrackingPixel, setEnableTrackingPixel] = useState(true);
  const [enableClickTracking, setEnableClickTracking] = useState(true);
  const [minDelay, setMinDelay] = useState(2);
  const [maxDelay, setMaxDelay] = useState(5);
  const [selectedSmtpIds, setSelectedSmtpIds] = useState<string[]>(smtps.filter(s => s.status === 'active').map(s => s.id));
  const [selectedListId, setSelectedListId] = useState('');
  const [manualRecipients, setManualRecipients] = useState('');
  const [isSending, setIsSending] = useState(false);

  const toggleSmtpSelection = (id: string) => {
    setSelectedSmtpIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getRecipients = (): Array<{ email: string; name: string; company?: string }> => {
    if (selectedListId) {
      const list = lists.find(l => l.id === selectedListId);
      if (list) return list.subscribers.map(s => ({ email: s.email, name: s.name, company: s.company }));
    }
    return manualRecipients.split('\n').map(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2 && parts[1].includes('@')) {
        return { name: parts[0], email: parts[1], company: parts[2] || '' };
      }
      return null;
    }).filter(Boolean) as Array<{ email: string; name: string; company?: string }>;
  };

  const handleStartSending = async () => {
    const recipients = getRecipients();
    if (recipients.length === 0) {
      showToast('No recipients! Paste emails or select a mailing list.', 'error');
      return;
    }
    if (selectedSmtpIds.length === 0) {
      showToast('Select at least one SMTP account', 'error');
      return;
    }
    if (!subject.trim()) {
      showToast('Enter a subject line', 'error');
      return;
    }

    const campaign: Campaign = {
      id: 'camp-' + Date.now(),
      name: `Bulk Send - ${new Date().toLocaleDateString()}`,
      senderName,
      fromEmail,
      replyTo,
      subject,
      bodyHtml,
      status: 'running',
      totalRecipients: recipients.length,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      bouncedCount: 0,
      smtpIds: selectedSmtpIds,
      delayMinSeconds: minDelay,
      delayMaxSeconds: maxDelay,
      enableTrackingPixel,
      enableClickTracking,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setIsSending(true);
    await startDispatch(campaign, recipients, minDelay, maxDelay);
  };

  const handleStopSending = async () => {
    await stopDispatch();
    setIsSending(false);
  };

  const renderPreview = (html: string) => {
    return html
      .replace(/\{\{name\}\}/g, '<span style="color:#7c3aed;font-weight:bold">John Doe</span>')
      .replace(/\{\{company\}\}/g, '<span style="color:#7c3aed;font-weight:bold">Acme Corp</span>')
      .replace(/\{\{email\}\}/g, '<span style="color:#7c3aed">john@acme.com</span>')
      .replace(/\{([^|}]+)\|([^}]+)\}/g, '<span style="color:#7c3aed;font-style:italic">[$1]</span>');
  };

  const recipients = getRecipients();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('bulkSender.title')}</h2>
          <p className="text-sm text-slate-300 mt-1">{t('bulkSender.subtitle')}</p>
        </div>
        {isDispatching && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold animate-pulse">
              <Radio className="w-3.5 h-3.5" /> SENDING {dispatchProgress.sent}/{dispatchProgress.total}
            </span>
            <button onClick={handleStopSending} className="glass-btn-danger text-xs">
              <Square className="w-4 h-4" /> Stop
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isDispatching && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300">{t('bulkSender.progress')}</span>
            <span className="text-xs font-bold text-white">{dispatchProgress.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-300" style={{ width: `${dispatchProgress.percentage}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400">
            <span>Current: {dispatchProgress.currentEmail}</span>
            <span>SMTP: {dispatchProgress.currentSmtp}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-5">
          {/* Content */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> Email Content
              </h3>
              <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${isPreviewMode ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                {isPreviewMode ? <Code className="w-4 h-4 inline mr-1" /> : <Eye className="w-4 h-4 inline mr-1" />}
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('bulkSender.campaignName')}</label>
                <input value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full glass-input text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">From Email</label>
                <select value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="w-full glass-input text-xs">
                  {smtps.map(s => <option key={s.id} value={s.fromEmail}>{s.fromEmail} ({s.name})</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('bulkSender.subject')}</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full glass-input text-xs font-mono" placeholder="{Hi|Hello} {{name}}" />
              <p className="text-[10px] text-slate-500 mt-1">{t('bulkSender.subjectSpintaxHint')}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('bulkSender.body')}</label>
              {isPreviewMode ? (
                <div className="bg-white rounded-xl p-6 max-h-80 overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: renderPreview(bodyHtml) }} className="text-sm text-gray-800" />
                </div>
              ) : (
                <textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} className="w-full h-56 glass-input text-xs font-mono resize-none" />
              )}
              <p className="text-[10px] text-slate-500 mt-1">{t('bulkSender.bodySpintaxHint')}</p>
            </div>
          </div>

          {/* Recipients */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> {t('bulkSender.recipients')}
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Mailing List (optional)</label>
              <select value={selectedListId} onChange={(e) => setSelectedListId(e.target.value)} className="w-full glass-input text-xs">
                <option value="">— Paste manually below —</option>
                {lists.map(l => <option key={l.id} value={l.id}>{l.name} ({l.subscribersCount} contacts)</option>)}
              </select>
            </div>
            {!selectedListId && (
              <textarea
                value={manualRecipients}
                onChange={(e) => setManualRecipients(e.target.value)}
                placeholder={t('bulkSender.recipientsPlaceholder')}
                className="w-full h-32 glass-input text-xs font-mono resize-none"
              />
            )}
            <p className="text-xs text-slate-400">{recipients.length} recipients detected</p>
          </div>
        </div>

        {/* Right Panel - Settings + Terminal */}
        <div className="space-y-5">
          {/* SMTP Selection */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" /> {t('bulkSender.selectSmtp')}
            </h3>
            {smtps.filter(s => s.status === 'active').map(s => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                <input type="checkbox" checked={selectedSmtpIds.includes(s.id)} onChange={() => toggleSmtpSelection(s.id)} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500" />
                <span className="text-xs text-slate-200">{s.name}</span>
                <span className="text-[10px] text-slate-500 ml-auto">{s.sentToday}/{s.dailyLimit}</span>
              </label>
            ))}
            {smtps.filter(s => s.status === 'active').length === 0 && (
              <p className="text-xs text-slate-500">No active SMTP accounts</p>
            )}
          </div>

          {/* Delay Settings */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> {t('bulkSender.randomDelay')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400">{t('bulkSender.minDelay')}</label>
                <input type="number" value={minDelay} onChange={(e) => setMinDelay(parseInt(e.target.value) || 2)} className="w-full glass-input text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">{t('bulkSender.maxDelay')}</label>
                <input type="number" value={maxDelay} onChange={(e) => setMaxDelay(parseInt(e.target.value) || 5)} className="w-full glass-input text-xs" />
              </div>
            </div>
          </div>

          {/* Tracking Options */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Tracking
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enableTrackingPixel} onChange={(e) => setEnableTrackingPixel(e.target.checked)} className="w-4 h-4 rounded bg-slate-700 text-purple-500" />
              <span className="text-xs text-slate-300">{t('bulkSender.trackingPixel')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enableClickTracking} onChange={(e) => setEnableClickTracking(e.target.checked)} className="w-4 h-4 rounded bg-slate-700 text-purple-500" />
              <span className="text-xs text-slate-300">{t('bulkSender.unsubscribeLink')}</span>
            </label>
          </div>

          {/* Send Button */}
          {!isDispatching && (
            <button onClick={handleStartSending} className="w-full glass-btn-primary py-3 text-sm font-bold">
              <Send className="w-5 h-5" /> {t('bulkSender.startCampaign')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
