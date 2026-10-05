import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sun, 
  Moon, 
  Bell, 
  Radio, 
  Globe 
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { activeTab, isWsConnected, language, setLanguage } = useApp();
  const { theme, toggleTheme } = useTheme();

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'campaigns': return 'Campaigns';
      case 'smtp_clusters': return 'Sending Servers';
      case 'lists_management': return 'Mailing Lists';
      case 'bulk_dispatcher': return 'Bulk Dispatcher';
      case 'analytics': return 'Analytics';
      case 'warmup': return 'Warmup Pool';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-20 bg-white/70 dark:bg-[#0c101d]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-8 flex items-center justify-between sticky top-0 z-30 select-none transition-colors duration-200">
      {/* Title & Path with vertical accent bar matching screenshot */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-purple-500 via-pink-500 to-amber-400" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {getBreadcrumbTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* System Pulse Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
          <Radio className={`w-3.5 h-3.5 ${isWsConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="font-semibold">{isWsConnected ? 'Sync Live' : 'Connecting...'}</span>
        </div>

        {/* Dark / Light Theme Toggle matching screenshots */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition-colors"
          title="Toggle Light / Dark Mode"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Notifications Icon */}
        <button
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500" />
        </button>

        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-1">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              language === 'ar'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            العربية
          </button>
        </div>
      </div>
    </header>
  );
};
