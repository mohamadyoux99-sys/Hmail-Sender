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
  X,
  MailCheck,
  Activity,
  AlertCircle,
  Loader2,
  Copy,
  BarChart3
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { SmtpAccount } from '../types';

export const SmtpManager: React.FC = () => {
  const { t } = useTranslation();
  const { smtps, saveSmtp, deleteSmtp, verifySmtp, sendTestEmail, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<SmtpAccount>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testEmailModal, setTestEmailModal] = useState<SmtpAccount | null>(null);
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.host || !formData.username) {
      showToast('Fill in all required fields', 'error');
      return;
    }
    saveSmtp(formData as SmtpAccount);
    setIsModalOpen(false);
    showToast('SMTP account saved', 'success');
  };

  const handleTest = async (account: SmtpAccount) => {
    setTestingId(account.id);
    await verifySmtp(account);
    setTestingId(null);
  };

  const handleSendTest = async () => {
    if (!testEmailModal || !testRecipient) return;
    setIsSendingTest(true);
    await sendTestEmail(testEmailModal, testRecipient);
    setIsSendingTest(false);
    setTestEmailModal(null);
    setTestRecipient('');
  };

  const activeCount = smtps.filter(s => s.status === 'active').length;
  const totalSentToday = smtps.reduce((a, s) => a + s.sentToday, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('smtp.title')}</h2>
          <p className="text-sm text-slate-300 mt-1">{t('smtp.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white/5 rounded-lg border border-white/10 p-0.5">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
              Grid
            </button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
              Table
            </button>
          </div>
          <button onClick={handleOpenAdd} className="glass-btn-primary text-xs">
            <Plus className="w-4 h-4" /> {t('smtp.addAccount')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-white">{smtps.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Accounts</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
          <p className="text-xs text-slate-400 mt-1">{t('smtp.status')}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{totalSentToday.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{t('smtp.sentToday')}</p>
        </div>
      </div>

      {/* SMTP List - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smtps.map((smtp) => (
            <div key={smtp.id} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${smtp.status === 'active' ? 'bg-emerald-500/20' : 'bg-slate-500/20'}`}>
                    <Server className={`w-5 h-5 ${smtp.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{smtp.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{smtp.host}:{smtp.port}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  smtp.status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : smtp.status === 'warming' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                  : 'text-red-400 bg-red-500/10 border-red-500/30'
                }`}>
                  {smtp.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-slate-400">From</p>
                  <p className="text-slate-200 truncate">{smtp.fromEmail}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-slate-400">Sent Today</p>
                  <p className="text-slate-200">{smtp.sentToday}/{smtp.dailyLimit}</p>
                </div>
              </div>

              {/* Health Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">{t('smtp.health')}</span>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${smtp.healthScore >= 80 ? 'bg-emerald-500' : smtp.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${smtp.healthScore}%` }} />
                </div>
                <span className="text-[10px] text-slate-400">{smtp.healthScore}%</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleTest(smtp)} disabled={testingId === smtp.id} className="flex-1 glass-btn-secondary text-xs py-2">
                  {testingId === smtp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  {testingId === smtp.id ? 'Testing...' : t('smtp.testConnection')}
                </button>
                <button onClick={() => setTestEmailModal(smtp)} className="flex-1 glass-btn-secondary text-xs py-2">
                  <MailCheck className="w-3.5 h-3.5" /> Test Email
                </button>
                <button onClick={() => { setFormData(smtp); setIsModalOpen(true); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteSmtp(smtp.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {smtps.length === 0 && (
            <div className="col-span-2 glass-card p-12 text-center">
              <Server className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No SMTP accounts configured</p>
              <button onClick={handleOpenAdd} className="glass-btn-primary text-xs mt-4">
                <Plus className="w-4 h-4" /> Add First SMTP
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-slate-400 font-semibold">Name</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Host</th>
                <th className="text-left p-3 text-slate-400 font-semibold">From</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Status</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Health</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Sent</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {smtps.map((smtp) => (
                <tr key={smtp.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-white font-medium">{smtp.name}</td>
                  <td className="p-3 text-slate-400 font-mono">{smtp.host}:{smtp.port}</td>
                  <td className="p-3 text-slate-300">{smtp.fromEmail}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      smtp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>{smtp.status.toUpperCase()}</span>
                  </td>
                  <td className="p-3">{smtp.healthScore}%</td>
                  <td className="p-3 text-slate-300">{smtp.sentToday}/{smtp.dailyLimit}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleTest(smtp)} className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"><Zap className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setFormData(smtp); setIsModalOpen(true); }} className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteSmtp(smtp.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">{formData.id?.startsWith('smtp-' + Date.now().toString().substring(0, 5)) ? 'Add SMTP' : 'Edit SMTP'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('smtp.accountName')}</label>
                  <input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full glass-input text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full glass-input text-xs">
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('smtp.host')}</label>
                  <input value={formData.host || ''} onChange={(e) => setFormData({ ...formData, host: e.target.value })} className="w-full glass-input text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('smtp.port')}</label>
                  <input type="number" value={formData.port || 465} onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 465 })} className="w-full glass-input text-xs font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('smtp.username')}</label>
                <input value={formData.username || ''} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full glass-input text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('smtp.password')}</label>
                <input type="password" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full glass-input text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('smtp.fromEmail')}</label>
                  <input value={formData.fromEmail || ''} onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })} className="w-full glass-input text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('smtp.fromName')}</label>
                  <input value={formData.fromName || ''} onChange={(e) => setFormData({ ...formData, fromName: e.target.value })} className="w-full glass-input text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('smtp.dailyLimit')}</label>
                <input type="number" value={formData.dailyLimit || 2000} onChange={(e) => setFormData({ ...formData, dailyLimit: parseInt(e.target.value) || 2000 })} className="w-full glass-input text-xs" />
              </div>
              <button type="submit" className="w-full glass-btn-primary text-xs py-3">
                <MailCheck className="w-4 h-4" /> {t('smtp.saveAccount')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {testEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setTestEmailModal(null)}>
          <div className="glass-card w-full max-w-sm p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Send Test Email</h3>
            <p className="text-xs text-slate-400 mb-3">Via: {testEmailModal.name} ({testEmailModal.host})</p>
            <input value={testRecipient} onChange={(e) => setTestRecipient(e.target.value)} placeholder="recipient@example.com" className="w-full glass-input text-sm mb-4" type="email" />
            <div className="flex gap-2">
              <button onClick={() => setTestEmailModal(null)} className="flex-1 glass-btn-secondary text-xs">Cancel</button>
              <button onClick={handleSendTest} disabled={isSendingTest || !testRecipient} className="flex-1 glass-btn-primary text-xs">
                {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSendingTest ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
