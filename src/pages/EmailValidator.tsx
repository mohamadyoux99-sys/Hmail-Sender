import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Copy,
  Loader2,
  Upload,
  Download,
  Mail
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { validateEmails } from '../services/apiService';
import { ValidationResult } from '../types';

export const EmailValidator: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useApp();

  const [singleEmail, setSingleEmail] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('bulk');

  const disposableDomains = ['tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com', 'yopmail.com', 'temp-mail.org', 'fakeinbox.com'];

  const validateSingle = async () => {
    if (!singleEmail.trim()) return showToast('Enter an email', 'error');
    setIsRunning(true);
    const res = await validateEmails([singleEmail.trim()]);
    setIsRunning(false);
    if (res.success && res.data?.length > 0) {
      setResults(res.data);
      const r = res.data[0];
      if (r.status === 'valid') showToast(`${singleEmail} is valid!`, 'success');
      else showToast(`${singleEmail} is ${r.status}`, 'warning');
    } else {
      showToast(res.message || 'Validation failed', 'error');
    }
  };

  const runBulkValidation = async () => {
    const emails = bulkInput.split('\n').map(e => e.trim()).filter(e => e.includes('@'));
    if (emails.length === 0) return showToast('Paste at least one email', 'error');
    setIsRunning(true);
    showToast(`Validating ${emails.length} emails...`, 'info');
    const res = await validateEmails(emails);
    setIsRunning(false);
    if (res.success && res.data) {
      setResults(res.data);
      const valid = res.data.filter((r: ValidationResult) => r.status === 'valid').length;
      showToast(`Done! ${valid}/${emails.length} valid`, 'success');
    } else {
      showToast(res.message || 'Validation failed', 'error');
    }
  };

  const removeDuplicates = () => {
    const unique = [...new Set(results.map(r => r.email))];
    setResults(prev => unique.map(email => prev.find(r => r.email === email)!));
    showToast(`Removed ${results.length - unique.length} duplicates`, 'info');
  };

  const exportClean = () => {
    const clean = results.filter(r => r.status === 'valid').map(r => r.email).join('\n');
    const blob = new Blob([clean], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clean_emails_${Date.now()}.txt`;
    a.click();
    showToast(`Exported ${results.filter(r => r.status === 'valid').length} clean emails`, 'success');
  };

  const validCount = results.filter(r => r.status === 'valid').length;
  const riskyCount = results.filter(r => r.status === 'catch_all').length;
  const disposableCount = results.filter(r => r.status === 'disposable').length;
  const invalidCount = results.filter(r => r.status === 'invalid' || r.status === 'syntax_error').length;

  const statusColors: Record<string, string> = {
    valid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    invalid: 'text-red-400 bg-red-500/10 border-red-500/30',
    disposable: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    catch_all: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    syntax_error: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('validator.title')}</h2>
          <p className="text-sm text-slate-300 mt-1">{t('validator.subtitle')}</p>
        </div>
        {results.length > 0 && (
          <div className="flex gap-2">
            <button onClick={removeDuplicates} className="glass-btn-secondary text-xs">
              <Copy className="w-4 h-4" /> Remove Duplicates
            </button>
            <button onClick={exportClean} className="glass-btn-primary text-xs">
              <Download className="w-4 h-4" /> Export Clean List
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('validator.validCount'), value: validCount, icon: CheckCircle2, color: 'emerald' },
            { label: t('validator.riskyCount'), value: riskyCount, icon: AlertTriangle, color: 'yellow' },
            { label: t('validator.disposableCount'), value: disposableCount, icon: Shield, color: 'amber' },
            { label: t('validator.invalidCount'), value: invalidCount, icon: XCircle, color: 'red' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-500/20 border border-${stat.color}-500/30`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Validation Input */}
      <div className="glass-card p-6">
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'single'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-1" /> {t('validator.singleValidation')}
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'bulk'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-1" /> {t('validator.bulkValidation')}
          </button>
        </div>

        {activeTab === 'single' ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="email"
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 glass-input text-sm"
                onKeyDown={(e) => e.key === 'Enter' && validateSingle()}
              />
              <button onClick={validateSingle} disabled={isRunning} className="glass-btn-primary text-xs">
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                {isRunning ? 'Checking...' : 'Validate'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={t('validator.pasteEmails')}
              className="w-full h-40 glass-input text-sm font-mono resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {bulkInput.split('\n').filter(e => e.includes('@')).length} emails detected
              </p>
              <button onClick={runBulkValidation} disabled={isRunning} className="glass-btn-primary text-xs">
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                {isRunning ? 'Validating...' : t('validator.validateNow')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-slate-400 font-semibold">Email</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">Status</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">Syntax</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">MX</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">SMTP Ping</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">Disposable</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">Score</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-slate-200">{r.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[r.status]}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">{r.syntaxValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                    <td className="p-3">{r.mxValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                    <td className="p-3">{r.smtpPingValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                    <td className="p-3">{r.isDisposable ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <span className="text-slate-500">No</span>}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${r.score >= 80 ? 'bg-emerald-500' : r.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${r.score}%` }} />
                        </div>
                        <span className="text-slate-400 text-[10px]">{r.score}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400 max-w-[200px] truncate">{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
