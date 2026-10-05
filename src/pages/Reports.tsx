import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Mail,
  MousePointerClick,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { exportData } from '../services/apiService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { campaigns, smtps, liveStats, showToast } = useApp();

  const totalSent = campaigns.reduce((a, c) => a + c.sentCount, 0);
  const totalDelivered = campaigns.reduce((a, c) => a + c.deliveredCount, 0);
  const totalOpened = campaigns.reduce((a, c) => a + c.openedCount, 0);
  const totalClicked = campaigns.reduce((a, c) => a + c.clickedCount, 0);
  const totalBounced = campaigns.reduce((a, c) => a + c.bouncedCount, 0);
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0';
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0';
  const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) : '0';

  const campaignChartData = {
    labels: campaigns.slice(0, 8).map(c => c.name.substring(0, 15)),
    datasets: [
      {
        label: 'Sent',
        data: campaigns.slice(0, 8).map(c => c.sentCount),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'Opened',
        data: campaigns.slice(0, 8).map(c => c.openedCount),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'Clicked',
        data: campaigns.slice(0, 8).map(c => c.clickedCount),
        backgroundColor: 'rgba(6, 182, 212, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
      tooltip: { backgroundColor: '#0c101d', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#fff', bodyColor: '#cbd5e1' },
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const handleExport = async (type: string) => {
    const res = await exportData(type);
    if (res.success) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hmailinbox_export_${type}_${Date.now()}.json`;
      a.click();
      showToast(`Exported ${type} data`, 'success');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('reports.title')}</h2>
          <p className="text-sm text-slate-300 mt-1">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('campaigns')} className="glass-btn-secondary text-xs">
            <Download className="w-4 h-4" /> {t('reports.exportExcel')}
          </button>
          <button onClick={() => handleExport('all')} className="glass-btn-primary text-xs">
            <FileText className="w-4 h-4" /> Full Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Delivery Rate', value: `${deliveryRate}%`, icon: CheckCircle2, color: 'emerald' },
          { label: 'Open Rate', value: `${openRate}%`, icon: Mail, color: 'purple' },
          { label: 'Click Rate', value: `${clickRate}%`, icon: MousePointerClick, color: 'cyan' },
          { label: 'Bounce Rate', value: `${bounceRate}%`, icon: AlertTriangle, color: 'red' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-5 text-center">
              <Icon className={`w-6 h-6 text-${stat.color}-400 mx-auto mb-2`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Campaign Chart */}
      {campaigns.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-4">{t('reports.campaignBreakdown')}</h3>
          <div className="h-72">
            <Bar data={campaignChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* SMTP Performance Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-white">{t('reports.smtpPerformance')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-slate-400 font-semibold">SMTP Name</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Status</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Health</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Sent Today</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Daily Limit</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {smtps.map((smtp) => {
                const utilization = smtp.dailyLimit > 0 ? Math.round((smtp.sentToday / smtp.dailyLimit) * 100) : 0;
                return (
                  <tr key={smtp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-white font-medium">{smtp.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        smtp.status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : smtp.status === 'warming' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                        : 'text-red-400 bg-red-500/10 border-red-500/30'
                      }`}>
                        {smtp.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${smtp.healthScore >= 80 ? 'bg-emerald-500' : smtp.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${smtp.healthScore}%` }} />
                        </div>
                        <span className="text-slate-400">{smtp.healthScore}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300">{smtp.sentToday.toLocaleString()}</td>
                    <td className="p-3 text-slate-300">{smtp.dailyLimit.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${utilization >= 90 ? 'bg-red-500' : utilization >= 60 ? 'bg-yellow-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                        </div>
                        <span className="text-slate-400">{utilization}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {smtps.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">No SMTP accounts configured yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
