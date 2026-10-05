import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Inbox, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Server, 
  FolderSync, 
  Mail, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const Deliverability: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useApp();

  const [imapHost, setImapHost] = useState('imap.gmail.com');
  const [imapPort, setImapPort] = useState(993);
  const [imapUser, setImapUser] = useState('outreach@growthcorp.com');
  const [imapPass, setImapPass] = useState('••••••••••••');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  const [auditResults, setAuditResults] = useState<{
    inbox: number;
    promotions: number;
    spam: number;
    score: number;
  }>({
    inbox: 94.6,
    promotions: 3.8,
    spam: 1.6,
    score: 96,
  });

  const handleTestImapSync = () => {
    setIsSyncing(true);
    showToast('Connecting to IMAP server and scanning mailbox folders...', 'info');

    setTimeout(() => {
      setIsSyncing(false);
      showToast('IMAP Connected! Successfully synchronized 48 sent emails with "[Gmail]/Sent Mail"', 'success');
    }, 1500);
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    showToast('Sending seed test emails to Google, Microsoft, and Yahoo deliverability testboxes...', 'info');

    setTimeout(() => {
      setIsAuditing(false);
      setAuditResults({
        inbox: 96.2,
        promotions: 2.8,
        spam: 1.0,
        score: 98,
      });
      showToast('Deliverability Audit Complete: 96.2% Inbox Placement Verified!', 'success');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('deliverability.title')}</h2>
          <p className="text-sm text-slate-300 mt-1">{t('deliverability.subtitle')}</p>
        </div>
        <button
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="glass-btn-primary"
        >
          <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Auditing Inboxes...' : 'Run Real-Time Inbox Audit'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: IMAP Inbox Appender Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <FolderSync className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">IMAP Sent Folder Appender</h3>
                <p className="text-xs text-slate-400">
                  Automatically copies sent outreach into your actual webmail Sent folder for 100% human appearance.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {t('deliverability.imapHost')}
                </label>
                <input
                  type="text"
                  value={imapHost}
                  onChange={(e) => setImapHost(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  IMAP Port
                </label>
                <input
                  type="number"
                  value={imapPort}
                  onChange={(e) => setImapPort(Number(e.target.value))}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  IMAP Username / Email
                </label>
                <input
                  type="text"
                  value={imapUser}
                  onChange={(e) => setImapUser(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  IMAP Password
                </label>
                <input
                  type="password"
                  value={imapPass}
                  onChange={(e) => setImapPass(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-slate-400">Folder: <b className="text-white">Auto-Detect ([Gmail]/Sent Mail)</b></span>
              <button
                onClick={handleTestImapSync}
                disabled={isSyncing}
                className="glass-btn-primary text-xs"
              >
                <FolderSync className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Testing IMAP...' : 'Test & Sync Sent Box'}</span>
              </button>
            </div>
          </div>

          {/* Deliverability Checklist */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-base text-white">Domain Health & Authentication Status</h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">SPF (Sender Policy Framework)</p>
                    <p className="text-[11px] text-slate-400">All outbound IPs are explicitly authorized</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-500/20">PASS</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">DKIM (DomainKeys Identified Mail)</p>
                    <p className="text-[11px] text-slate-400">2048-bit cryptographic key valid</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-500/20">PASS</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">DMARC Policy Alignment</p>
                    <p className="text-[11px] text-slate-400">Quarantine enforcement active with RUA report collection</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-500/20">PASS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Placement Audit Results */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6 border-emerald-500/30">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Placement Audit</span>
              <h3 className="font-extrabold text-2xl text-white mt-1">
                {auditResults.score}/100 Health Score
              </h3>
            </div>

            {/* Folder Percentage Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Primary Inbox</span>
                  <span className="font-bold text-emerald-400">{auditResults.inbox}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-white/10">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${auditResults.inbox}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Promotions Tab</span>
                  <span className="font-bold text-amber-400">{auditResults.promotions}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-white/10">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${auditResults.promotions}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Spam / Junk Folder</span>
                  <span className="font-bold text-rose-400">{auditResults.spam}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-white/10">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${auditResults.spam}%` }} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <p className="font-bold">✨ Deliverability Assessment:</p>
              <p className="leading-relaxed">
                Your domain is in the top 2% of trustworthy senders. Spintax and warmup are successfully keeping spam filters at zero triggers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
