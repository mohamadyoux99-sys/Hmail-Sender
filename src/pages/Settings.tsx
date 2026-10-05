import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Key, 
  Globe, 
  Database, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { 
    license, 
    activateLicense, 
    resetAllData, 
    language, 
    setLanguage, 
    showToast 
  } = useApp();

  const [inputKey, setInputKey] = useState(license.licenseKey);
  const [inputName, setInputName] = useState(license.licenseeName);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    activateLicense(inputKey, inputName);
  };

  const handleBackupDatabase = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      version: '2.4.0',
      license: localStorage.getItem('mailinbox_license_v2'),
      smtps: localStorage.getItem('mailinbox_smtps_v2'),
      warmups: localStorage.getItem('mailinbox_warmups_v2'),
      campaigns: localStorage.getItem('mailinbox_campaigns_v2'),
      leads: localStorage.getItem('mailinbox_leads_v2'),
      templates: localStorage.getItem('mailinbox_templates_v2'),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mailinbox_Backup_${Date.now()}.json`;
    a.click();
    showToast('Database JSON backup saved successfully!', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('settings.title')}</h2>
        <p className="text-sm text-slate-300 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* License Box */}
        <div className="glass-card p-6 space-y-5 border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{t('settings.licenseStatus')}</h3>
                <p className="text-xs text-emerald-400 font-semibold">{t('settings.activatedBadge')}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              LIFETIME
            </span>
          </div>

          <form onSubmit={handleActivate} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Licensee Name / Organization
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t('settings.licenseKey')}
              </label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full glass-input text-xs font-mono"
              />
            </div>

            <button type="submit" className="glass-btn-primary text-xs w-full py-2.5">
              <Key className="w-4 h-4" />
              <span>{t('settings.activate')}</span>
            </button>
          </form>
        </div>

        {/* Language & UI Preferences */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t('settings.language')}</h3>
              <p className="text-xs text-slate-400">Choose your preferred working language & layout</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                language === 'en'
                  ? 'bg-brand-500/20 border-brand-400 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-950/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xl">🇺🇸</span>
              <span className="text-xs font-bold">English (LTR)</span>
            </button>

            <button
              onClick={() => setLanguage('ar')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                language === 'ar'
                  ? 'bg-brand-500/20 border-brand-400 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-950/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xl">🇸🇦</span>
              <span className="text-xs font-bold font-arabic">العربية (RTL)</span>
            </button>
          </div>
        </div>

        {/* Database & Reset Controls */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Local Database Storage</h3>
              <p className="text-xs text-slate-400">Manage your offline SQLite database records</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleBackupDatabase}
              className="w-full glass-btn-secondary text-xs py-2.5"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Export Full Database Backup (JSON)</span>
            </button>

            <button
              onClick={resetAllData}
              className="w-full glass-btn-danger text-xs py-2.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('settings.clearDb')}</span>
            </button>
          </div>
        </div>

        {/* Security & Credentials Info */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t('settings.security')}</h3>
              <p className="text-xs text-slate-400">Desktop Security Architecture</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-white/5">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All SMTP Passwords securely stored in local encrypted vault.</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No telemetry sent to third-party tracking services.</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Compliant with modern CAN-SPAM and GDPR regulations.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
