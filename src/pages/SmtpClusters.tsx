import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Server, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Zap, 
  Send, 
  ShieldCheck, 
  X, 
  MailCheck, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { SmtpAccount } from '../types';

export const SmtpClusters: React.FC = () => {
  const { t } = useTranslation();
  const { smtps, saveSmtp, deleteSmtp, verifySmtp, sendTestEmail, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<SmtpAccount>>({});
  
  // Real Test Email Modal State
  const [testEmailModalAccount, setTestEmailModalAccount] = useState<SmtpAccount | null>(null);
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const [testingId, setTestingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setFormData({
      id: 'smtp-' + Date.now(),
      name: '',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      username: '',
      password: '',
      fromEmail: '',
      fromName: '',
      replyTo: '',
      dailyLimit: 2000,
      sentToday: 0,
      status: 'active',
      healthScore: 98,
      createdAt: new Date().toISOString().substring(0, 10),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (account: SmtpAccount) => {
    setFormData(account);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.host || !formData.username || !formData.fromEmail) {
      showToast('Please fill in all required SMTP fields', 'error');
      return;
    }

    const accountToSave: SmtpAccount = {
      id: formData.id || 'smtp-' + Date.now(),
      name: formData.name,
      host: formData.host,
      port: Number(formData.port) || 587,
      secure: Boolean(formData.secure),
      username: formData.username,
      password: formData.password || '',
      fromEmail: formData.fromEmail,
      fromName: formData.fromName || formData.name,
      replyTo: formData.replyTo || formData.fromEmail,
      dailyLimit: Number(formData.dailyLimit) || 2000,
      sentToday: formData.sentToday || 0,
      status: formData.status || 'active',
      healthScore: formData.healthScore || 95,
      createdAt: formData.createdAt || new Date().toISOString().substring(0, 10),
      lastTested: 'Just now',
    };

    saveSmtp(accountToSave);
    setIsModalOpen(false);
  };

  const handleTestConnection = async (account: SmtpAccount) => {
    setTestingId(account.id);
    await verifySmtp(account);
    setTestingId(null);
  };

  const handleSendTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailModalAccount || !testRecipient.includes('@')) {
      showToast('Please enter a valid email to receive test message', 'error');
      return;
    }

    setIsSendingTest(true);
    await sendTestEmail(testEmailModalAccount, testRecipient);
    setIsSendingTest(false);
    setTestEmailModalAccount(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Sending Servers (SMTP Clusters)</h2>
          <p className="text-xs text-slate-400 mt-0.5">High-availability SMTP rotation pool with real TLS verification and test delivery</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New SMTP Cluster</span>
        </button>
      </div>

      {/* Grid of SMTP Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {smtps.map((s) => {
          const quotaPercent = Math.min(100, Math.round((s.sentToday / s.dailyLimit) * 100));
          const isTesting = testingId === s.id;

          return (
            <div key={s.id} className="p-6 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-4 shadow-sm dark:shadow-none hover:border-purple-500/40 transition-all">
              {/* Top Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{s.host}:{s.port}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  s.status === 'active' ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400' :
                  'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {s.status}
                </span>
              </div>

              {/* Info Details */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">From Email:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{s.fromEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Encryption:</span>
                  <span className="font-semibold text-cyan-500 dark:text-cyan-400">{s.secure ? 'SSL (Direct 465)' : 'STARTTLS (587)'}</span>
                </div>
              </div>

              {/* Daily Limit Meter */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Sent Today: <b className="text-slate-800 dark:text-slate-100">{s.sentToday.toLocaleString()}</b> / {s.dailyLimit.toLocaleString()}</span>
                  <span className="font-bold text-purple-500">{quotaPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-400" style={{ width: `${quotaPercent}%` }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Health: <b className="text-emerald-400">{s.healthScore}/100</b></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTestEmailModalAccount(s)}
                    className="px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 dark:text-pink-400 text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Send real test email to an inbox"
                  >
                    <MailCheck className="w-3.5 h-3.5" />
                    <span>Send Test Email</span>
                  </button>

                  <button
                    onClick={() => handleTestConnection(s)}
                    disabled={isTesting}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Verify'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteSmtp(s.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit SMTP Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/10 max-w-xl w-full rounded-2xl p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {formData.id ? 'Configure SMTP Server' : 'Add SMTP Server'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Server Friendly Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Google Workspace Dedicated #1"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    SMTP Host Server *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.host || ''}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Port *
                  </label>
                  <select
                    value={formData.port || 465}
                    onChange={(e) => setFormData({ ...formData, port: Number(e.target.value), secure: Number(e.target.value) === 465 })}
                    className="w-full glass-input text-xs"
                  >
                    <option value={465}>465 (SSL)</option>
                    <option value={587}>587 (TLS)</option>
                    <option value={25}>25 (Std)</option>
                    <option value={2525}>2525 (Relay)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Username / Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Password / App Password
                  </label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    From Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.fromEmail || ''}
                    onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    From Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.fromName || ''}
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
                >
                  Save SMTP Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Real Test Email Modal */}
      {testEmailModalAccount && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111628] border border-pink-500/30 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MailCheck className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Send Real Test Email</h3>
              </div>
              <button
                onClick={() => setTestEmailModalAccount(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Dispatch a real test email through <b>{testEmailModalAccount.name}</b> ({testEmailModalAccount.host}) to confirm your inbox placement.
            </p>

            <form onSubmit={handleSendTestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Recipient Test Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTestEmailModalAccount(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-md shadow-pink-500/30 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? 'Sending Test...' : 'Send Live Test'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
