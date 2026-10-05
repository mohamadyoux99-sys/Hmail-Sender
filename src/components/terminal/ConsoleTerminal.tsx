import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { TerminalLog } from '../../types';

interface ConsoleTerminalProps {
  logs: TerminalLog[];
  onClearLogs: () => void;
  isConnected: boolean;
}

export const ConsoleTerminal: React.FC<ConsoleTerminalProps> = ({
  logs,
  onClearLogs,
  isConnected
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return <span className="text-emerald-400 font-bold">[SUCCESS]</span>;
      case 'ERROR':
        return <span className="text-rose-400 font-bold">[ERROR]</span>;
      case 'WARN':
        return <span className="text-amber-400 font-bold">[WARN]</span>;
      case 'SMTP':
        return <span className="text-cyan-400 font-bold">[SMTP]</span>;
      case 'TRACK':
        return <span className="text-purple-400 font-bold">[TRACK]</span>;
      default:
        return <span className="text-blue-400 font-bold">[INFO]</span>;
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950 dark:bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="bg-slate-900/90 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700 text-slate-300 font-semibold">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Live Dispatcher Terminal & Telemetry</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-[10px]">
            <Radio className={`w-2.5 h-2.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className={isConnected ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {isConnected ? 'WebSocket Sync: ONLINE' : 'WebSocket: CONNECTING'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal log body */}
      {isExpanded && (
        <div className="p-4 max-h-56 min-h-36 overflow-y-auto space-y-1.5 bg-black/90 text-slate-200">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic py-6 text-center">
              Terminal ready. Logs and real-time delivery telemetry will appear here...
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed hover:bg-white/5 px-1 py-0.5 rounded">
                <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                <span className="shrink-0 select-none">{getLevelBadge(log.level)}</span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
