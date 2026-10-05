import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Megaphone, 
  PlayCircle, 
  CheckCircle2, 
  Server, 
  Menu, 
  Users, 
  Navigation, 
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useApp } from '../contexts/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { campaigns, smtps, lists, liveStats, setActiveTab } = useApp();

  const totalCampaigns = campaigns.length;
  const runningCampaigns = campaigns.filter(c => c.status === 'running').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
  const activeSmtpCount = smtps.filter(s => s.status === 'active').length;
  const mailingListsCount = lists.length;
  const totalSubscribers = liveStats.totalSubscribers;
  const sentToday = liveStats.sentToday;
  const sentThisMonth = liveStats.sentThisMonth;

  // Chart data matching screenshot wave
  const waveChartData = {
    labels: ['570', '760', '950', '1,140', '1,330', '1,520', '1,710', '1,900', '2,090', '2,280', '2,470', '2,660', '2,850', '3,040', '3,230'],
    datasets: [
      {
        label: 'Sent',
        data: [600, 680, 800, 1000, 1400, 2100, 3200, 2400, 1600, 650, 950, 1650, 1600, 1200, 800],
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.12)',
        fill: true,
        tension: 0.45,
        borderWidth: 2.5,
        pointBackgroundColor: '#a855f7',
        pointRadius: (ctx: any) => (ctx.dataIndex === 6 || ctx.dataIndex === 11 ? 5 : 0),
      },
    ],
  };

  const waveChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c101d',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 8 Top Metric Cards Grid matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. TOTAL CAMPAIGNS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              TOTAL CAMPAIGNS
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              {totalCampaigns}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        {/* 2. RUNNING */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              RUNNING
            </span>
            <span className="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1 block">
              {runningCampaigns}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        {/* 3. COMPLETED */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              COMPLETED
            </span>
            <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 mt-1 block">
              {completedCampaigns}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* 4. SMTP SERVERS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              SMTP SERVERS
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-cyan-500 dark:text-cyan-400">{smtps.length}</span>
              <span className="text-[10px] text-emerald-500 font-semibold">{activeSmtpCount} active</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
            <Server className="w-5 h-5" />
          </div>
        </div>

        {/* 5. MAILING LISTS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              MAILING LISTS
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              {mailingListsCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Menu className="w-5 h-5" />
          </div>
        </div>

        {/* 6. SUBSCRIBERS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              SUBSCRIBERS
            </span>
            <span className="text-2xl font-black text-pink-500 dark:text-pink-400 mt-1 block">
              {totalSubscribers.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* 7. SENT TODAY */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              SENT TODAY
            </span>
            <span className="text-2xl font-black text-cyan-500 dark:text-cyan-400 mt-1 block">
              {sentToday.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Navigation className="w-5 h-5" />
          </div>
        </div>

        {/* 8. SENT THIS MONTH */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              SENT THIS MONTH
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              {sentThisMonth.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Section: Chart on Left (8 Cols) & Latest Campaigns on Right (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Sending Statistics Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Email Sending Statistics</h3>
              <p className="text-xs text-slate-400 mt-0.5">Track sent, opened and clicked metrics over the last 7 days.</p>
            </div>
            {/* Chart Legend Indicators */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-600 dark:text-slate-300">Sent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-600 dark:text-slate-300">Opened</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-slate-600 dark:text-slate-300">Clicks</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <Line data={waveChartData} options={waveChartOptions} />
          </div>
        </div>

        {/* Right Column: Latest Campaigns Widget */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#111628] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-pink-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Latest Campaigns</h3>
            </div>
            <button
              onClick={() => setActiveTab('campaigns')}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
            {campaigns.slice(0, 5).map((camp) => {
              const initials = camp.name.substring(0, 2).toUpperCase();
              return (
                <div
                  key={camp.id}
                  onClick={() => setActiveTab('campaigns')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-500 dark:text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{camp.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{camp.fromEmail}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] shrink-0 ${
                    camp.status === 'completed' ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400' :
                    camp.status === 'running' ? 'bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 animate-pulse' :
                    camp.status === 'stopped' ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400' :
                    'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {camp.status}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setActiveTab('bulk_dispatcher')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>Launch Bulk Dispatcher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
