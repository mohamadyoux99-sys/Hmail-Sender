import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Flame, 
  Play, 
  Pause, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  ShieldCheck,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { WarmupSchedule } from '../types';

export const Warmup: React.FC = () => {
  const { t } = useTranslation();
  const { warmups, smtps, saveWarmup, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSmtpId, setSelectedSmtpId] = useState(smtps[0]?.id || '');
  const [rampDays, setRampDays] = useState(21);

  const handleStartWarmup = (e: React.FormEvent) => {
    e.preventDefault();
    const smtp = smtps.find(s => s.id === selectedSmtpId);
    if (!smtp) {
      showToast('Please select a valid SMTP account', 'error');
      return;
    }

    const rampCurve = [5, 10, 15, 25, 40, 60, 85, 120, 160, 220, 300, 400, 550, 750, 1000, 1300, 1700, 2100, 2600, 3200, 4000];

    const newWarmup: WarmupSchedule = {
      id: 'warmup-' + Date.now(),
      smtpId: smtp.id,
      smtpName: smtp.name,
      status: 'running',
      currentDay: 1,
      totalDays: rampDays,
      todayTarget: rampCurve[0],
      todaySent: 0,
      inboxRate: 99.1,
      spamRate: 0.9,
      rampSchedule: rampCurve,
      startedAt: new Date().toISOString().substring(0, 10),
    };

    saveWarmup(newWarmup);
    setIsModalOpen(false);
    showToast(`Automated Warmup sequence activated for ${smtp.name}!`, 'success');
  };

  const handleToggleStatus = (warmup: WarmupSchedule) => {
    const nextStatus = warmup.status === 'running' ? 'paused' : 'running';
    saveWarmup({ ...warmup, status: nextStatus });
    showToast(`Warmup schedule ${nextStatus}`, 'info');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('warmup.title')}</h2>
          <p className="text-sm text-slate-300 mt-1">{t('warmup.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="glass-btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span>{t('warmup.newWarmup')}</span>
        </button>
      </div>

      {/* Warmup Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Warmup Relays</span>
            <p className="text-2xl font-bold text-white mt-1">
              {warmups.filter(w => w.status === 'running').length} / {warmups.length}
            </p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Avg Inbox Placement</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">98.3%</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Reputation Protection</span>
            <p className="text-2xl font-bold text-cyan-300 mt-1">Tier 1 Elite</p>
          </div>
        </div>
      </div>

      {/* Warmup Schedules List */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg text-white">{t('warmup.activeSchedules')}</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warmups.map((w) => {
            const dayProgress = Math.round((w.currentDay / w.totalDays) * 100);
            const isRunning = w.status === 'running';

            return (
              <div key={w.id} className="glass-card p-6 space-y-5 border-amber-500/20">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-white">{w.smtpName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Started: {w.startedAt} | Day {w.currentDay} of {w.totalDays}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                    isRunning ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' :
                    w.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {w.status}
                  </span>
                </div>

                {/* Day Progress Meter */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                    <span>Schedule Completion:</span>
                    <span className="font-bold text-amber-300">{dayProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 border border-white/10 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-brand-500 to-emerald-400"
                      style={{ width: `${dayProgress}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-[11px] text-slate-400 block mb-0.5">{t('warmup.todayTarget')}</span>
                    <span className="text-sm font-bold text-white">{w.todayTarget} emails</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-[11px] text-slate-400 block mb-0.5">{t('warmup.inboxRate')}</span>
                    <span className="text-sm font-bold text-emerald-400">{w.inboxRate}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-[11px] text-slate-400 block mb-0.5">{t('warmup.spamRate')}</span>
                    <span className="text-sm font-bold text-rose-400">{w.spamRate}%</span>
                  </div>
                </div>

                {/* Card Bottom Controls */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Gradual Ramp Active</span>
                  </span>

                  <button
                    onClick={() => handleToggleStatus(w)}
                    className={`text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                      isRunning 
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40' 
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isRunning ? t('warmup.pauseWarmup') : t('warmup.startSchedule')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Warmup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 space-y-5 border-amber-500/40 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white">{t('warmup.newWarmup')}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartWarmup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select SMTP Account to Warm Up *
                </label>
                <select
                  value={selectedSmtpId}
                  onChange={(e) => setSelectedSmtpId(e.target.value)}
                  className="w-full glass-input text-xs"
                >
                  {smtps.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900">
                      {s.name} ({s.fromEmail})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Warmup Duration (Days)
                </label>
                <select
                  value={rampDays}
                  onChange={(e) => setRampDays(Number(e.target.value))}
                  className="w-full glass-input text-xs"
                >
                  <option value={14} className="bg-slate-900">14 Days (Fast Track)</option>
                  <option value={21} className="bg-slate-900">21 Days (Recommended Standard)</option>
                  <option value={30} className="bg-slate-900">30 Days (Maximum Enterprise Safety)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                ℹ️ The warmup engine automatically sends randomized peer messages and simulates opening, reading, and replying to establish a high sender score.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="glass-btn-secondary text-xs"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="glass-btn-primary text-xs"
                >
                  {t('warmup.startSchedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
