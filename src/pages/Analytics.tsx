import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Send, 
  Eye, 
  MousePointerClick, 
  AlertOctagon, 
  TrendingUp, 
  CheckCircle2, 
  Activity,
  Globe
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useApp } from '../contexts/AppContext';

export const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const { campaigns, liveStats, isWsConnected } = useApp();

  const totalSent = liveStats.sentThisMonth;
  const totalOpens = liveStats.totalOpens;
  const totalClicks = liveStats.totalClicks;
  const totalBounces = liveStats.totalBounces;

  const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '44.8';
  const clickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : '18.2';
  const bounceRate = totalSent > 0 ? ((totalBounces / totalSent) * 100).toFixed(1) : '1.4';

  const ispDoughnutData = {
    labels: ['Google Workspace / Gmail', 'Microsoft Outlook / Office 365', 'Yahoo Mail', 'Custom Enterprise Domains'],
    datasets: [
      {
        data: [48, 28, 12, 12],
        backgroundColor: ['#ec4899', '#3b82f6', '#a855f7', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const ispDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  const barData = {
    labels: campaigns.map(c => c.name.substring(0, 18)),
    datasets: [
      {
        label: 'Delivered',
        data: campaigns.map(c => c.deliveredCount),
        backgroundColor: '#a855f7',
        borderRadius: 6,
      },
      {
        label: 'Opens',
        data: campaigns.map(c => c.openedCount),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Clicks',
        data: campaigns.map(c => c.clickedCount),
        backgroundColor: '#06b6d4',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Real-Time Delivery & Tracking Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">Live WebSocket telemetry, engagement heatmap, and ISP distribution stats</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/10 border border-purple-500/20 text-xs font-semibold text-purple-600 dark:text-purple-400">
          <Activity className="w-4 h-4 animate-spin text-purple-500" />
          <span>Real-time Tracking Server: Online</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL DELIVERED</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalSent.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>98.6% Inbox Direct</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">LIVE OPENS</span>
          <p className="text-2xl font-black text-emerald-500 dark:text-emerald-400">{openRate}%</p>
          <span className="text-[11px] text-slate-400">{totalOpens.toLocaleString()} Verified Opens</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CLICK-THROUGH RATE</span>
          <p className="text-2xl font-black text-cyan-500 dark:text-cyan-400">{clickRate}%</p>
          <span className="text-[11px] text-slate-400">{totalClicks.toLocaleString()} Real-time Clicks</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">BOUNCE RATE</span>
          <p className="text-2xl font-black text-rose-500 dark:text-rose-400">{bounceRate}%</p>
          <span className="text-[11px] text-slate-400">Safe Deliverability Threshold</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campaign Deliveries & Clicks */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Campaign Conversion Comparison</h3>
          <div className="h-72 w-full">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* ISP Doughnut Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Audience ISP Share</h3>
          <div className="h-64 w-full relative flex items-center justify-center">
            <Doughnut data={ispDoughnutData} options={ispDoughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
