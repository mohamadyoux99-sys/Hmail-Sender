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
  Radio
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ConsoleTerminal } from '../components/terminal/ConsoleTerminal';
import { IspBreakdown } from '../components/campaign/IspBreakdown';
import { Campaign } from '../types';

export const BulkDispatcher: React.FC = () => {
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
    showToast 
  } = useApp();

  // Campaign Config Form
  const [subject, setSubject] = useState('{Hi|Hello} {{name}}, important update regarding {{company}}');
  const [senderName, setSenderName] = useState('Alex Rivers | GrowthCorp');
  const [fromEmail, setFromEmail] = useState(smtps[0]?.fromEmail || 'alex@growthcorp.com');
  const [replyTo, setReplyTo] = useState('alex@growthcorp.com');

  // Content state
  const [bodyHtml, setBodyHtml] = useState(
`<div style="font-family: sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px;">
  <h2>Hello {{name}},</h2>
  <p>{Hope you are having a productive week!|Reaching out with an exclusive invitation for {{company}}.}</p>
  <p>We launched Dispatcher Pro v6.1 with real-time SMTP clustering and WebSocket deliverability tracking.</p>
  <p><a href="http://localhost:3001/api/tracking/click/camp-1/{{email}}?url=https://example.com" style="display:inline-block; padding:10px 20px; background:#a855f7; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">View Live Demonstration</a></p>
  <br>
  <p>Best regards,<br><b>The Dispatcher Team</b></p>
  <!-- Real 1x1 Tracking Pixel automatically injected -->
  <img src="http://localhost:3001/api/tracking/pixel/camp-1/{{email}}" width="1" height="1" style="display:none;" />
</div>`
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Selected SMTP Clusters for rotation
  const [selectedSmtpIds, setSelectedSmtpIds] = useState<string[]>(
    smtps.map(s => s.id)
  );

  // Recipients input text
  const [recipientsText, setRecipientsText] = useState(
`John Doe,john@gmail.com,Acme Corp
Sarah Connor,sarah@cyberdyne.org,Cyberdyne
David Miller,david@outlook.com,Miller Law
Karim Mansour,karim@horizonproperties.ae,Horizon
Elena Rostova,elena@yahoo.com,Nordic Systems
Marcus Brody,marcus@gmail.com,Brody Labs`
  );

  const [minDelay, setMinDelay] = useState(2);
  const [maxDelay, setMaxDelay] = useState(5);

  const handleToggleSmtp = (id: string) => {
    if (selectedSmtpIds.includes(id)) {
      if (selectedSmtpIds.length > 1) {
        setSelectedSmtpIds(selectedSmtpIds.filter(s => s !== id));
      } else {
        showToast('Keep at least 1 active SMTP selected for rotation', 'warning');
      }
    } else {
      setSelectedSmtpIds([...selectedSmtpIds, id]);
    }
  };

  const handleLoadList = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    const formatted = list.subscribers.map(s => `${s.name},${s.email},${s.company || 'Business'}`).join('\n');
    if (formatted) {
      setRecipientsText(formatted);
      showToast(`Loaded ${list.subscribers.length} contacts from "${list.name}"!`, 'success');
    } else {
      showToast(`Mailing list "${list.name}" has ${list.subscribersCount} subscribers`, 'info');
    }
  };

  // Parse recipients
  const parseRecipients = () => {
    const lines = recipientsText.split('\n').filter(l => l.trim().length > 0);
    return lines.map((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        return {
          name: parts[0] || 'Friend',
          email: parts[1],
          company: parts[2] || 'Company',
        };
      }
      return {
        name: 'Contact ' + (idx + 1),
        email: parts[0],
        company: 'Company',
      };
    }).filter(r => r.email.includes('@'));
  };

  const parsedRecipients = parseRecipients();
  const recipientEmails = parsedRecipients.map(r => r.email);

  const handleStartDispatch = async () => {
    if (parsedRecipients.length === 0) {
      showToast('Please enter at least one valid recipient email!', 'error');
      return;
    }
    if (selectedSmtpIds.length === 0) {
      showToast('Please select at least one SMTP cluster!', 'error');
      return;
    }

    const campaignToRun: Campaign = {
      id: 'camp-' + Date.now(),
      name: `Dispatch - ${subject.substring(0, 25)}`,
      senderName,
      fromEmail,
      replyTo,
      subject,
      bodyHtml,
      status: 'running',
      totalRecipients: parsedRecipients.length,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      bouncedCount: 0,
      smtpIds: selectedSmtpIds,
      delayMinSeconds: minDelay,
      delayMaxSeconds: maxDelay,
      enableTrackingPixel: true,
      enableClickTracking: true,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    await startDispatch(campaignToRun, parsedRecipients, minDelay, maxDelay);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Bulk Dispatcher (Control Room)</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time synchronized multi-SMTP dispatch engine with live telemetry</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isDispatching ? (
            <button
              onClick={stopDispatch}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Dispatch</span>
            </button>
          ) : (
            <button
              onClick={handleStartDispatch}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Real Dispatch</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (Visible during dispatch) */}
      {isDispatching && (
        <div className="p-4 rounded-2xl bg-purple-600/10 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
              <span>Dispatch in Progress: Sending to {dispatchProgress.currentEmail || 'targets'}...</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {dispatchProgress.sent} / {dispatchProgress.total} ({dispatchProgress.percentage}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${dispatchProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Email Config, Content, Recipients & ISP */}
        <div className="lg:col-span-8 space-y-6">
          {/* Email Config Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Email Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  From Email Address
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Subject Line (Supports Spintax)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full glass-input text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Content & HTML Editor Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Message Content (HTML & Variables)</span>
              </h3>

              <div className="flex items-center gap-2">
                {['{{name}}', '{{company}}', '{{email}}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setBodyHtml(prev => prev + ' ' + tag)}
                    className="px-2 py-0.5 rounded bg-purple-600/20 text-purple-400 text-[10px] font-mono hover:bg-purple-600/30"
                  >
                    {tag}
                  </button>
                ))}
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isPreviewMode ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isPreviewMode ? 'Editor' : 'Preview'}</span>
                </button>
              </div>
            </div>

            {isPreviewMode ? (
              <div 
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 min-h-60 leading-relaxed overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <textarea
                rows={10}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="w-full glass-input font-mono text-xs leading-relaxed"
                placeholder="Write HTML message here..."
              />
            )}
          </div>

          {/* Recipients Section & Live ISP Breakdown */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-500" />
                  <span>Recipients List ({parsedRecipients.length} Detected)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Format: Name, Email, Company (one per line)</p>
              </div>

              {/* Quick load from saved lists */}
              {lists.length > 0 && (
                <select
                  onChange={(e) => handleLoadList(e.target.value)}
                  className="glass-input text-xs py-1 px-3"
                  defaultValue=""
                >
                  <option value="" disabled>Load from Mailing List...</option>
                  {lists.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.subscribersCount})</option>
                  ))}
                </select>
              )}
            </div>

            <textarea
              rows={6}
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
              className="w-full glass-input font-mono text-xs leading-relaxed"
              placeholder="Paste email list here..."
            />

            {/* ISP Breakdown Widget */}
            <IspBreakdown emails={recipientEmails} />
          </div>
        </div>

        {/* Right 4 Cols: SMTP Clusters Rotation & Throttle Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* SMTP Clusters Multi-Select */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>SMTP Cluster Selection</span>
              </h3>
              <span className="text-[11px] text-purple-500 dark:text-purple-400 font-bold">
                {selectedSmtpIds.length} Rotated
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Emails alternate evenly across selected clusters to protect sender reputation.
            </p>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {smtps.map((s) => {
                const isSelected = selectedSmtpIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => handleToggleSmtp(s.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-600/15 border-purple-500/50 shadow-md shadow-purple-600/10'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{s.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">{s.fromEmail}</span>
                    </div>

                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      isSelected ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-600'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Random Delay Anti-Spam */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Throttle & Anti-Spam Delay</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Randomized Interval:</span>
                <span className="font-bold text-purple-500 dark:text-purple-400">{minDelay}s — {maxDelay}s</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={minDelay}
                onChange={(e) => setMinDelay(Math.min(Number(e.target.value), maxDelay - 1))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-purple-600/10 border border-purple-500/20 text-[11px] text-purple-600 dark:text-purple-300 leading-relaxed">
              ✨ Real-time Open Tracking Pixel & Click Tracker active via Node backend.
            </div>
          </div>
        </div>
      </div>

      {/* Docked Console Terminal */}
      <ConsoleTerminal
        logs={terminalLogs}
        onClearLogs={clearTerminalLogs}
        isConnected={isWsConnected}
      />
    </div>
  );
};
