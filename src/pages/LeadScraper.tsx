import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Search,
  Download,
  Send,
  Loader2,
  MapPin,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { scrapeLeads } from '../services/apiService';
import { LeadItem } from '../types';

export const LeadScraper: React.FC = () => {
  const { t } = useTranslation();
  const { showToast, setActiveTab } = useApp();

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [limit, setLimit] = useState(50);
  const [autoValidate, setAutoValidate] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [leads, setLeads] = useState<LeadItem[]>([]);

  const handleScrape = async () => {
    if (!keyword.trim()) return showToast('Enter a search keyword', 'error');
    setIsScraping(true);
    showToast(`Scraping leads for "${keyword}"...`, 'info');
    const res = await scrapeLeads(keyword, location, limit);
    setIsScraping(false);
    if (res.success && res.data) {
      setLeads(res.data);
      showToast(`Found ${res.data.length} leads!`, 'success');
    } else {
      showToast(res.message || 'Scraping failed', 'error');
    }
  };

  const exportCsv = () => {
    if (leads.length === 0) return;
    const headers = 'Name,Company,Email,Phone,Website,City,Category,Status\n';
    const rows = leads.map(l => `${l.name},${l.company},${l.email},${l.phone},${l.website},${l.city},${l.category},${l.status}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${keyword}_${Date.now()}.csv`;
    a.click();
    showToast('Exported leads CSV', 'success');
  };

  const exportExcel = () => {
    exportCsv();
  };

  const transferToBulkSender = () => {
    showToast('Leads transferred to Bulk Sender!', 'success');
    setActiveTab('bulk_sender');
  };

  const validLeads = leads.filter(l => l.status === 'valid').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('leadScraper.title')}</h2>
          <p className="text-sm text-slate-300 mt-1">{t('leadScraper.subtitle')}</p>
        </div>
        {leads.length > 0 && (
          <div className="flex gap-2">
            <button onClick={exportExcel} className="glass-btn-secondary text-xs"><Download className="w-4 h-4" /> {t('leadScraper.exportExcel')}</button>
            <button onClick={exportCsv} className="glass-btn-secondary text-xs"><Download className="w-4 h-4" /> {t('leadScraper.exportCsv')}</button>
            <button onClick={transferToBulkSender} className="glass-btn-primary text-xs"><Send className="w-4 h-4" /> {t('leadScraper.transferToSender')}</button>
          </div>
        )}
      </div>

      {/* Stats */}
      {leads.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-white">{leads.length}</p>
            <p className="text-xs text-slate-400 mt-1">{t('leadScraper.extractedLeads')}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{validLeads}</p>
            <p className="text-xs text-slate-400 mt-1">Valid Emails</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{Math.round((validLeads / leads.length) * 100)}%</p>
            <p className="text-xs text-slate-400 mt-1">Quality Rate</p>
          </div>
        </div>
      )}

      {/* Scraper Form */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">{t('leadScraper.keyword')}</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Real Estate, Software Companies"
              className="w-full glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">{t('leadScraper.location')}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York, Dubai, London"
              className="w-full glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">{t('leadScraper.limit')}</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
              min={10}
              max={500}
              className="w-full glass-input text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoValidate}
              onChange={(e) => setAutoValidate(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-xs text-slate-300">{t('leadScraper.autoValidate')}</span>
          </label>
        </div>
        <button onClick={handleScrape} disabled={isScraping} className="glass-btn-primary text-xs">
          {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          {isScraping ? 'Extracting...' : t('leadScraper.startScraping')}
        </button>
      </div>

      {/* Results */}
      {leads.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{t('leadScraper.extractedLeads')} ({leads.length})</h3>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm">
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-slate-400 font-semibold">Name</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">Company</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">Email</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">Phone</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">City</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">Category</th>
                  <th className="text-left p-3 text-slate-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-slate-200 font-medium">{lead.name}</td>
                    <td className="p-3 text-slate-300">{lead.company}</td>
                    <td className="p-3 text-cyan-400 font-mono">{lead.email}</td>
                    <td className="p-3 text-slate-400">{lead.phone}</td>
                    <td className="p-3 text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.city}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        {lead.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        lead.status === 'valid' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : lead.status === 'risky' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                        : 'text-red-400 bg-red-500/10 border-red-500/30'
                      }`}>
                        {lead.status.toUpperCase()}
                      </span>
                    </td>
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
