import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Megaphone,
  Server,
  Users,
  Send,
  BarChart3,
  Flame,
  Settings,
  LogOut,
  Mail,
  FileText,
  Wrench,
  ClipboardCheck,
  Globe,
  AlertTriangle,
  UserCheck,
  List,
  Shield
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { NavTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { activeTab, setActiveTab, campaigns, smtps, lists, isDispatching, logout, user } = useApp();

  const mainMenu: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string }> = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, badge: campaigns.length },
    { id: 'smtp_clusters', label: 'Sending Servers', icon: Server, badge: smtps.length },
    { id: 'lists_management', label: 'Mailing Lists', icon: Users, badge: lists.length },
    { id: 'bulk_sender', label: t('nav.bulk_sender'), icon: Send },
  ];

  const toolsMenu: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }> = [
    { id: 'campaign_builder', label: t('nav.campaign_builder'), icon: FileText },
    { id: 'email_validator', label: t('nav.email_validator'), icon: ClipboardCheck },
    { id: 'lead_scraper', label: t('nav.lead_scraper'), icon: Globe },
    { id: 'pro_tools', label: t('nav.pro_tools'), icon: Wrench },
    { id: 'reports', label: t('nav.reports'), icon: BarChart3 },
  ];

  const systemMenu: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }> = [
    { id: 'bulk_dispatcher', label: 'Bulk Dispatcher', icon: Send, badge: isDispatching ? 'LIVE' : undefined },
    { id: 'warmup', label: t('nav.warmup'), icon: Flame },
    { id: 'deliverability', label: t('nav.deliverability'), icon: Shield },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const renderMenuSection = (title: string, items: typeof mainMenu) => (
    <div>
      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2 block">
        {title}
      </span>
      <div className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-64 bg-slate-900/90 dark:bg-[#0c101d] border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0 min-h-screen select-none transition-colors duration-200">
      {/* Brand Logo */}
      <div className="p-6 pb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-0.5 shadow-lg shadow-pink-500/20 flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-slate-900/60 dark:bg-[#0c101d] rounded-2xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-pink-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">HMail</span>
            <span className="text-xs font-semibold text-pink-500">Inbox</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Email Marketing v1.0</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {renderMenuSection('MAIN MENU', mainMenu)}
        {renderMenuSection('TOOLS', toolsMenu)}
        {renderMenuSection('SYSTEM', systemMenu)}
      </div>

      {/* Bottom User Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-pink-500/30 shrink-0">
            {user?.displayName?.substring(0, 2)?.toUpperCase() || 'AD'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.displayName || 'Admin'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.username || 'admin'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
