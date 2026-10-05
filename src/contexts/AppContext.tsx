import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NavTab, SmtpAccount, Campaign, MailingList, TerminalLog, WarmupSchedule, LicenseInfo, User } from '../types';
import * as api from '../services/apiService';

interface ToastMessage { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; }

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isAuthenticated: boolean;
  user: User | null;
  loginAction: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  smtps: SmtpAccount[];
  campaigns: Campaign[];
  lists: MailingList[];
  warmups: WarmupSchedule[];
  terminalLogs: TerminalLog[];
  isWsConnected: boolean;
  liveStats: { sentToday: number; sentThisMonth: number; totalSubscribers: number; activeSmtpCount: number; totalOpens: number; totalClicks: number; totalBounces: number; };
  isDispatching: boolean;
  activeDispatchCampaign: Campaign | null;
  dispatchProgress: { sent: number; total: number; currentEmail: string; currentSmtp: string; percentage: number; };
  saveSmtpAction: (account: SmtpAccount) => void;
  saveSmtp: (account: SmtpAccount) => void;
  deleteSmtpAction: (id: string) => void;
  deleteSmtp: (id: string) => void;
  verifySmtp: (account: SmtpAccount) => Promise<{ success: boolean; message: string; latency?: number }>;
  sendTestEmail: (smtp: SmtpAccount, to: string, subject?: string, body?: string) => Promise<{ success: boolean; message: string }>;
  saveCampaignAction: (campaign: Campaign) => void;
  saveCampaign: (campaign: Campaign) => void;
  duplicateCampaignAction: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  deleteCampaignAction: (id: string) => void;
  deleteCampaign: (id: string) => void;
  saveListAction: (list: MailingList) => void;
  saveList: (list: MailingList) => void;
  deleteListAction: (id: string) => void;
  deleteList: (id: string) => void;
  saveWarmupAction: (warmup: WarmupSchedule) => void;
  saveWarmup: (warmup: WarmupSchedule) => void;
  startDispatch: (campaign: Campaign, recipients: Array<{ email: string; name: string; company?: string }>, minDelay?: number, maxDelay?: number) => Promise<void>;
  stopDispatch: () => Promise<void>;
  resetAllData: () => void;
  clearTerminalLogs: () => void;
  addTerminalLog: (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'SMTP' | 'TRACK', message: string) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  language: string;
  setLanguage: (lng: string) => void;
  isRtl: boolean;
  refreshData: () => void;
  license: LicenseInfo;
  activateLicense: (key: string, name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('hmailinbox_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hmailinbox_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Data
  const [smtps, setSmtps] = useState<SmtpAccount[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [lists, setLists] = useState<MailingList[]>([]);
  const [warmups, setWarmups] = useState<WarmupSchedule[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    { id: '1', time: new Date().toLocaleTimeString(), level: 'INFO', message: 'HMailInbox v1.0 initialized' },
  ]);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [activeDispatchCampaign, setActiveDispatchCampaign] = useState<Campaign | null>(null);
  const [dispatchProgress, setDispatchProgress] = useState({ sent: 0, total: 0, currentEmail: '', currentSmtp: '', percentage: 0 });
  const [stats, setStats] = useState({ totalOpens: 0, totalClicks: 0, totalBounces: 0, sentToday: 0, totalSent: 0 });
  const [license, setLicense] = useState<LicenseInfo>(() => {
    const saved = localStorage.getItem('hmailinbox_license');
    if (saved) return JSON.parse(saved);
    return {
      isActivated: true,
      licenseKey: 'HMAILINBOX-PRO-LIFETIME-2024',
      licenseeName: 'Enterprise User',
      edition: 'Pro Lifetime',
      expiresAt: 'never',
      maxSmtpAccounts: 100,
      unlimitedSending: true,
    };
  });

  const language = i18n.language || 'en';
  const isRtl = language === 'ar';

  // Toast helpers
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => { setToasts(prev => prev.filter(t => t.id !== id)); }, []);

  const activateLicense = useCallback((key: string, name: string) => {
    const newLicense: LicenseInfo = {
      isActivated: true,
      licenseKey: key,
      licenseeName: name,
      edition: 'Pro Lifetime',
      expiresAt: 'never',
      maxSmtpAccounts: 100,
      unlimitedSending: true,
    };
    setLicense(newLicense);
    localStorage.setItem('hmailinbox_license', JSON.stringify(newLicense));
    showToast('License activated successfully!', 'success');
  }, [showToast]);

  // Terminal
  const addTerminalLog = useCallback((level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'SMTP' | 'TRACK', message: string) => {
    setTerminalLogs(prev => [...prev.slice(-150), {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: new Date().toLocaleTimeString(), level, message
    }]);
  }, []);

  const clearTerminalLogs = useCallback(() => setTerminalLogs([]), []);

  // Login
  const loginAction = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password);
    if (res.success && res.token) {
      localStorage.setItem('hmailinbox_token', res.token);
      localStorage.setItem('hmailinbox_user', JSON.stringify(res.user));
      setIsAuthenticated(true);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.displayName}!`, 'success');
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('hmailinbox_token');
    localStorage.removeItem('hmailinbox_user');
    setIsAuthenticated(false);
    setUser(null);
    showToast('Logged out', 'info');
  }, [showToast]);

  // Fetch all data from server
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [smtpRes, campRes, listRes, warmupRes, statsRes] = await Promise.all([
        api.fetchSmtps(), api.fetchCampaigns(), api.fetchLists(), api.fetchWarmups(), api.fetchStats()
      ]);
      if (smtpRes.success) setSmtps(smtpRes.data || []);
      if (campRes.success) setCampaigns(campRes.data || []);
      if (listRes.success) setLists(listRes.data || []);
      if (warmupRes.success) setWarmups(warmupRes.data || []);
      if (statsRes.success) setStats(statsRes.data || {});
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => { refreshData(); }, [refreshData]);

  // WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      try {
        const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3001`;
        ws = new WebSocket(wsUrl);
        ws.onopen = () => { setIsWsConnected(true); addTerminalLog('SUCCESS', 'WebSocket connected'); };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'TERMINAL_LOG') setTerminalLogs(prev => [...prev.slice(-150), data.data]);
            else if (data.type === 'DISPATCH_PROGRESS') setDispatchProgress({ sent: data.data.sent, total: data.data.total, currentEmail: data.data.currentEmail || '', currentSmtp: data.data.currentSmtp || '', percentage: data.data.progress });
            else if (data.type === 'OPEN_EVENT') { showToast(`Email opened by ${data.data.email}`, 'info'); setCampaigns(prev => prev.map(c => c.id === data.data.campaignId ? { ...c, openedCount: c.openedCount + 1 } : c)); }
            else if (data.type === 'CLICK_EVENT') { showToast(`Link clicked by ${data.data.email}`, 'success'); setCampaigns(prev => prev.map(c => c.id === data.data.campaignId ? { ...c, clickedCount: c.clickedCount + 1 } : c)); }
            else if (data.type === 'DISPATCH_COMPLETE') { setIsDispatching(false); refreshData(); showToast('Dispatch completed!', 'success'); }
          } catch (e) { /* ignore */ }
        };
        ws.onclose = () => { setIsWsConnected(false); reconnectTimer = setTimeout(connectWs, 4000); };
        ws.onerror = () => { setIsWsConnected(false); };
      } catch { setIsWsConnected(false); }
    };
    connectWs();
    return () => { ws?.close(); if (reconnectTimer) clearTimeout(reconnectTimer); };
  }, [isAuthenticated, addTerminalLog, showToast, refreshData]);

  // Language
  const setLanguage = useCallback((lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('hmailinbox_lang', lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    showToast(lng === 'ar' ? 'تم التحويل إلى العربية' : 'Switched to English', 'success');
  }, [i18n, showToast]);

  useEffect(() => {
    const saved = localStorage.getItem('hmailinbox_lang') || 'en';
    setLanguage(saved);
  }, []);

  // CRUD Actions (all sync with server)
  const saveSmtpAction = useCallback(async (account: SmtpAccount) => {
    await api.saveSmtp(account);
    showToast('SMTP saved', 'success');
    refreshData();
  }, [showToast, refreshData]);

  const deleteSmtpAction = useCallback(async (id: string) => {
    await api.deleteSmtp(id);
    showToast('SMTP removed', 'info');
    refreshData();
  }, [showToast, refreshData]);

  const verifySmtp = useCallback(async (account: SmtpAccount) => {
    addTerminalLog('SMTP', `Testing ${account.host}:${account.port}...`);
    const res = await api.testSmtpConnection(account);
    if (res.success) { addTerminalLog('SUCCESS', `Connected (${res.latency}ms)`); showToast(`Connected! (${res.latency}ms)`, 'success'); }
    else { addTerminalLog('ERROR', res.message); showToast(`Failed: ${res.message}`, 'error'); }
    return res;
  }, [addTerminalLog, showToast]);

  const sendTestEmail = useCallback(async (smtp: SmtpAccount, to: string, subject?: string, body?: string) => {
    addTerminalLog('SMTP', `Sending test to ${to}...`);
    const res = await api.sendRealTestEmail(smtp, to, subject, body);
    if (res.success) { addTerminalLog('SUCCESS', `Delivered to ${to}`); showToast(`Sent to ${to}!`, 'success'); }
    else { addTerminalLog('ERROR', res.message); showToast(`Failed: ${res.message}`, 'error'); }
    return { success: res.success, message: res.message || 'Done' };
  }, [addTerminalLog, showToast]);

  const saveCampaignAction = useCallback(async (campaign: Campaign) => {
    await api.saveCampaign(campaign);
    showToast('Campaign saved', 'success');
    refreshData();
  }, [showToast, refreshData]);

  const duplicateCampaignAction = useCallback(async (id: string) => {
    await api.duplicateCampaign(id);
    showToast('Campaign duplicated', 'success');
    refreshData();
  }, [showToast, refreshData]);

  const deleteCampaignAction = useCallback(async (id: string) => {
    await api.deleteCampaign(id);
    showToast('Campaign deleted', 'info');
    refreshData();
  }, [showToast, refreshData]);

  const saveListAction = useCallback(async (list: MailingList) => {
    await api.saveList(list);
    showToast('List saved', 'success');
    refreshData();
  }, [showToast, refreshData]);

  const deleteListAction = useCallback(async (id: string) => {
    await api.deleteList(id);
    showToast('List removed', 'info');
    refreshData();
  }, [showToast, refreshData]);

  const saveWarmupAction = useCallback(async (warmup: WarmupSchedule) => {
    await api.saveWarmup(warmup);
    showToast('Warmup updated', 'success');
    refreshData();
  }, [showToast, refreshData]);

  // Dispatch
  const startDispatch = useCallback(async (campaign: Campaign, recipients: Array<{ email: string; name: string; company?: string }>, minDelay = 2, maxDelay = 5) => {
    if (smtps.length === 0) { showToast('Configure at least one SMTP first!', 'error'); return; }
    if (recipients.length === 0) { showToast('No recipients!', 'error'); return; }
    const selectedSmtps = smtps.filter(s => campaign.smtpIds?.includes(s.id) || s.status === 'active');
    setIsDispatching(true);
    setActiveDispatchCampaign(campaign);
    setDispatchProgress({ sent: 0, total: recipients.length, currentEmail: recipients[0]?.email || '', currentSmtp: selectedSmtps[0]?.name || '', percentage: 0 });
    showToast(`Dispatching to ${recipients.length} recipients...`, 'success');
    await api.startBulkDispatch(campaign, selectedSmtps, recipients, minDelay, maxDelay);
  }, [smtps, showToast]);

  const stopDispatch = useCallback(async () => {
    await api.stopBulkDispatch();
    setIsDispatching(false);
    if (activeDispatchCampaign) {
      await api.saveCampaign({ ...activeDispatchCampaign, status: 'stopped' });
    }
    showToast('Dispatch stopped', 'warning');
    refreshData();
  }, [activeDispatchCampaign, showToast, refreshData]);

  const resetAllData = useCallback(() => { localStorage.clear(); window.location.reload(); }, []);

  const totalSubscribers = lists.reduce((acc, l) => acc + (l.subscribersCount || 0), 0);
  const liveStats = {
    sentToday: stats.sentToday || 0,
    sentThisMonth: stats.totalSent || 0,
    totalSubscribers,
    activeSmtpCount: smtps.filter(s => s.status === 'active').length,
    totalOpens: stats.totalOpens || 0,
    totalClicks: stats.totalClicks || 0,
    totalBounces: stats.totalBounces || 0,
  };

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab, isAuthenticated, user, loginAction, logout,
      smtps, campaigns, lists, warmups, terminalLogs, isWsConnected, liveStats,
      isDispatching, activeDispatchCampaign, dispatchProgress,
      saveSmtpAction, saveSmtp: saveSmtpAction,
      deleteSmtpAction, deleteSmtp: deleteSmtpAction,
      verifySmtp, sendTestEmail,
      saveCampaignAction, saveCampaign: saveCampaignAction,
      duplicateCampaignAction, duplicateCampaign: duplicateCampaignAction,
      deleteCampaignAction, deleteCampaign: deleteCampaignAction,
      saveListAction, saveList: saveListAction,
      deleteListAction, deleteList: deleteListAction,
      saveWarmupAction, saveWarmup: saveWarmupAction,
      startDispatch, stopDispatch, resetAllData,
      clearTerminalLogs, addTerminalLog,
      toasts, showToast, removeToast,
      language, setLanguage, isRtl, refreshData,
      license, activateLicense
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
