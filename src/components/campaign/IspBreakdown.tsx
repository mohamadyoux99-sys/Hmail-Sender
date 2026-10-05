import React, { useMemo } from 'react';
import { Mail, BarChart2 } from 'lucide-react';

interface IspBreakdownProps {
  emails: string[];
}

export const IspBreakdown: React.FC<IspBreakdownProps> = ({ emails }) => {
  const breakdown = useMemo(() => {
    let gmail = 0;
    let outlook = 0;
    let yahoo = 0;
    let other = 0;

    emails.forEach(e => {
      const lower = e.toLowerCase();
      if (lower.includes('@gmail.com') || lower.includes('@googlemail.com')) {
        gmail++;
      } else if (lower.includes('@outlook.') || lower.includes('@hotmail.') || lower.includes('@live.') || lower.includes('@msn.')) {
        outlook++;
      } else if (lower.includes('@yahoo.') || lower.includes('@ymail.') || lower.includes('@aol.')) {
        yahoo++;
      } else if (lower.includes('@')) {
        other++;
      }
    });

    const total = emails.length || 1;
    return {
      gmail,
      outlook,
      yahoo,
      other,
      total: emails.length,
      gmailPct: Math.round((gmail / total) * 100),
      outlookPct: Math.round((outlook / total) * 100),
      yahooPct: Math.round((yahoo / total) * 100),
      otherPct: Math.round((other / total) * 100),
    };
  }, [emails]);

  if (emails.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/40 dark:bg-slate-950/40 border border-slate-800 text-xs text-slate-500 text-center">
        Paste or upload recipients to view ISP breakdown analytics
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 dark:bg-slate-950/60 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>ISP Domain Breakdown ({breakdown.total} contacts)</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Gmail */}
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <div className="flex justify-between items-center mb-1">
            <span className="text-rose-300 font-semibold">Gmail</span>
            <span className="text-white font-bold">{breakdown.gmail}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${breakdown.gmailPct}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{breakdown.gmailPct}%</span>
        </div>

        {/* Outlook */}
        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-300 font-semibold">Outlook</span>
            <span className="text-white font-bold">{breakdown.outlook}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${breakdown.outlookPct}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{breakdown.outlookPct}%</span>
        </div>

        {/* Yahoo */}
        <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex justify-between items-center mb-1">
            <span className="text-purple-300 font-semibold">Yahoo</span>
            <span className="text-white font-bold">{breakdown.yahoo}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${breakdown.yahooPct}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{breakdown.yahooPct}%</span>
        </div>

        {/* Custom / Corporate */}
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex justify-between items-center mb-1">
            <span className="text-emerald-300 font-semibold">Custom / B2B</span>
            <span className="text-white font-bold">{breakdown.other}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${breakdown.otherPct}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{breakdown.otherPct}%</span>
        </div>
      </div>
    </div>
  );
};
