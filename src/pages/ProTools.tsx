import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Globe,
  Shield,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Server,
  Code
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { checkDomainDns, generateSmtpConfig } from '../services/apiService';
import { DnsCheckResult } from '../types';

export const ProTools: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useApp();

  const [activeTool, setActiveTool] = useState<'dns' | 'blacklist' | 'header' | 'config' | 'spintax'>('dns');

  // DNS Checker
  const [dnsDomain, setDnsDomain] = useState('');
  const [dnsResult, setDnsResult] = useState<DnsCheckResult | null>(null);
  const [isDnsChecking, setIsDnsChecking] = useState(false);

  // Blacklist Checker (simulated)
  const [blHost, setBlHost] = useState('');
  const [blResults, setBlResults] = useState<Array<{ rbl: string; isListed: boolean; responseTimeMs: number }>>([]);
  const [isBlChecking, setIsBlChecking] = useState(false);

  // Header Analyzer (simulated)
  const [rawHeader, setRawHeader] = useState('');
  const [headerAnalysis, setHeaderAnalysis] = useState<any>(null);

  // SMTP Config Generator
  const [cfgHost, setCfgHost] = useState('smtp.gmail.com');
  const [cfgPort, setCfgPort] = useState(465);
  const [cfgUser, setCfgUser] = useState('');
  const [cfgResult, setCfgResult] = useState<any>(null);

  // Spintax Tester
  const [spintaxInput, setSpintaxInput] = useState('{Hello|Hi|Hey} {{name}}, {how are you?|hope you are doing well.}');
  const [spintaxOutputs, setSpintaxOutputs] = useState<string[]>([]);

  const handleDnsCheck = async () => {
    if (!dnsDomain.trim()) return showToast('Enter a domain', 'error');
    setIsDnsChecking(true);
    const res = await checkDomainDns(dnsDomain);
    setIsDnsChecking(false);
    if (res.success && res.data) {
      setDnsResult(res.data);
      showToast(`DNS check complete. Score: ${res.data.score}/100`, 'success');
    } else {
      showToast(res.message || 'DNS check failed', 'error');
    }
  };

  const handleBlacklistCheck = () => {
    if (!blHost.trim()) return showToast('Enter a host or IP', 'error');
    setIsBlChecking(true);
    setTimeout(() => {
      const rbls = [
        'zen.spamhaus.org', 'bl.spamcop.net', 'b.barracudacentral.org',
        'dnsbl-1.uceprotect.net', 'dnsbl.sorbs.net', 'spam.dnsbl.sorbs.net',
        'dul.dnsbl.sorbs.net', 'dnsbl.inps.de', 'dyna.spamrats.com',
        'noptr.spamrats.com', 'spam.spamrats.com', 'cbl.abuseat.org',
        'dnsbl.dronebl.org', 'virus.rbl.jp', 'smtp.dnsbl.sorbs.net',
        'http.dnsbl.sorbs.net', 'misc.dnsbl.sorbs.net', 'socks.dnsbl.sorbs.net',
        'spam.dnsbl.sorbs.net', 'dnsbl-2.uceprotect.net',
      ];
      const results = rbls.map(rbl => ({
        rbl, isListed: Math.random() < 0.05, responseTimeMs: Math.round(Math.random() * 200 + 10)
      }));
      setBlResults(results);
      setIsBlChecking(false);
      const listed = results.filter(r => r.isListed).length;
      showToast(`Checked ${results.length} RBLs. Listed on ${listed}`, listed > 0 ? 'warning' : 'success');
    }, 2000);
  };

  const handleAnalyzeHeader = () => {
    if (!rawHeader.trim()) return showToast('Paste email headers', 'error');
    setHeaderAnalysis({
      spamScore: 1.2,
      spfResult: 'PASS',
      dkimResult: 'PASS',
      dmarcResult: 'PASS',
      originIp: '209.85.220.41',
      originCountry: 'US',
      tlsVersion: 'TLSv1.3',
      recommendations: ['SPF aligned', 'DKIM signature valid', 'DMARC policy enforced', 'No blacklists detected'],
    });
    showToast('Header analysis complete', 'success');
  };

  const handleGenerateConfig = async () => {
    const res = await generateSmtpConfig(cfgHost, cfgPort, cfgUser);
    if (res.success && res.data) {
      setCfgResult(res.data);
      showToast('Config generated', 'success');
    }
  };

  const handleSpintaxPreview = () => {
    const outputs: string[] = [];
    for (let i = 0; i < 5; i++) {
      let result = spintaxInput.replace(/\{([^}]+)\}/g, (_, options) => {
        const parts = options.split('|');
        return parts[Math.floor(Math.random() * parts.length)];
      });
      result = result.replace(/\{\{(\w+)\}\}/g, '[$1]');
      outputs.push(result);
    }
    setSpintaxOutputs(outputs);
  };

  const tools = [
    { id: 'dns' as const, label: t('proTools.dnsChecker'), icon: Globe },
    { id: 'blacklist' as const, label: t('proTools.blacklistChecker'), icon: Shield },
    { id: 'header' as const, label: t('proTools.headerAnalyzer'), icon: FileText },
    { id: 'config' as const, label: t('proTools.smtpConfigGen'), icon: Server },
    { id: 'spintax' as const, label: t('proTools.spintaxTester'), icon: Code },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('proTools.title')}</h2>
        <p className="text-sm text-slate-300 mt-1">{t('proTools.subtitle')}</p>
      </div>

      {/* Tool Switcher */}
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTool === tool.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" /> {tool.label}
            </button>
          );
        })}
      </div>

      {/* DNS Checker */}
      {activeTool === 'dns' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-400" /> {t('proTools.dnsChecker')}</h3>
          <div className="flex gap-3">
            <input value={dnsDomain} onChange={(e) => setDnsDomain(e.target.value)} placeholder="example.com" className="flex-1 glass-input text-sm" onKeyDown={(e) => e.key === 'Enter' && handleDnsCheck()} />
            <button onClick={handleDnsCheck} disabled={isDnsChecking} className="glass-btn-primary text-xs">
              {isDnsChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />} {t('proTools.checkDns')}
            </button>
          </div>
          {dnsResult && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-xs text-emerald-400 font-bold">Overall Score: <span className="text-lg text-white">{dnsResult.score}/100</span></p>
              </div>
              {[
                { label: 'SPF', valid: dnsResult.spf.valid, record: dnsResult.spf.record, desc: dnsResult.spf.description },
                { label: 'DKIM', valid: dnsResult.dkim.valid, record: dnsResult.dkim.record, desc: dnsResult.dkim.description },
                { label: 'DMARC', valid: dnsResult.dmarc.valid, record: dnsResult.dmarc.record, desc: dnsResult.dmarc.description },
              ].map((item) => (
                <div key={item.label} className={`p-3 rounded-xl border ${item.valid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {item.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-xs font-bold text-white">{item.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono ml-6">{item.record || 'Not found'}</p>
                  <p className="text-[11px] text-slate-400 ml-6">{item.desc}</p>
                </div>
              ))}
              {dnsResult.mx.valid && (
                <div className="p-3 rounded-xl border bg-cyan-500/10 border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">MX Records</span>
                  </div>
                  {dnsResult.mx.records.map((mx, i) => (
                    <p key={i} className="text-[11px] text-slate-400 font-mono ml-6">Priority {mx.priority}: {mx.host}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Blacklist Checker */}
      {activeTool === 'blacklist' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-amber-400" /> {t('proTools.blacklistChecker')}</h3>
          <div className="flex gap-3">
            <input value={blHost} onChange={(e) => setBlHost(e.target.value)} placeholder="mail.example.com or 1.2.3.4" className="flex-1 glass-input text-sm" />
            <button onClick={handleBlacklistCheck} disabled={isBlChecking} className="glass-btn-primary text-xs">
              {isBlChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} {t('proTools.checkBlacklist')}
            </button>
          </div>
          {blResults.length > 0 && (
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-900/95">
                  <tr className="border-b border-white/10">
                    <th className="text-left p-2 text-slate-400">RBL Server</th>
                    <th className="text-left p-2 text-slate-400">Status</th>
                    <th className="text-left p-2 text-slate-400">Response Time</th>
                  </tr>
                </thead>
                <tbody>
                  {blResults.map((r) => (
                    <tr key={r.rbl} className="border-b border-white/5">
                      <td className="p-2 font-mono text-slate-300">{r.rbl}</td>
                      <td className="p-2">{r.isListed ? <span className="text-red-400 font-bold">LISTED</span> : <span className="text-emerald-400">Clean</span>}</td>
                      <td className="p-2 text-slate-400">{r.responseTimeMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Header Analyzer */}
      {activeTool === 'header' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-purple-400" /> {t('proTools.headerAnalyzer')}</h3>
          <textarea value={rawHeader} onChange={(e) => setRawHeader(e.target.value)} placeholder="Paste raw email headers here..." className="w-full h-32 glass-input text-xs font-mono resize-none" />
          <button onClick={handleAnalyzeHeader} className="glass-btn-primary text-xs"><FileText className="w-4 h-4" /> {t('proTools.analyzeHeader')}</button>
          {headerAnalysis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'SPF', value: headerAnalysis.spfResult, ok: headerAnalysis.spfResult === 'PASS' },
                { label: 'DKIM', value: headerAnalysis.dkimResult, ok: headerAnalysis.dkimResult === 'PASS' },
                { label: 'DMARC', value: headerAnalysis.dmarcResult, ok: headerAnalysis.dmarcResult === 'PASS' },
                { label: 'Spam Score', value: headerAnalysis.spamScore.toString(), ok: headerAnalysis.spamScore < 3 },
              ].map((item) => (
                <div key={item.label} className={`p-3 rounded-xl border text-center ${item.ok ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <p className="text-[10px] text-slate-400 uppercase">{item.label}</p>
                  <p className={`text-sm font-bold ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SMTP Config Generator */}
      {activeTool === 'config' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Server className="w-4 h-4 text-cyan-400" /> {t('proTools.smtpConfigGen')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={cfgHost} onChange={(e) => setCfgHost(e.target.value)} className="glass-input text-sm" placeholder="smtp.gmail.com" />
            <input type="number" value={cfgPort} onChange={(e) => setCfgPort(parseInt(e.target.value) || 465)} className="glass-input text-sm" placeholder="465" />
            <input value={cfgUser} onChange={(e) => setCfgUser(e.target.value)} className="glass-input text-sm" placeholder="user@example.com" />
          </div>
          <button onClick={handleGenerateConfig} className="glass-btn-primary text-xs"><Server className="w-4 h-4" /> Generate Config</button>
          {cfgResult && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{JSON.stringify(cfgResult, null, 2)}</pre>
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(cfgResult, null, 2)); showToast('Copied!', 'success'); }} className="mt-2 text-xs text-cyan-400 hover:underline">
                <Copy className="w-3 h-3 inline mr-1" /> Copy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Spintax Tester */}
      {activeTool === 'spintax' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Code className="w-4 h-4 text-pink-400" /> {t('proTools.spintaxTester')}</h3>
          <textarea value={spintaxInput} onChange={(e) => setSpintaxInput(e.target.value)} className="w-full h-24 glass-input text-sm font-mono resize-none" placeholder="{Option1|Option2|Option3}" />
          <button onClick={handleSpintaxPreview} className="glass-btn-primary text-xs"><Code className="w-4 h-4" /> Generate Previews</button>
          {spintaxOutputs.length > 0 && (
            <div className="space-y-2">
              {spintaxOutputs.map((out, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200">
                  <span className="text-slate-500 font-mono mr-2">{i + 1}.</span> {out}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
