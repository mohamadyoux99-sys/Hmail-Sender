import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { useApp } from './contexts/AppContext';
import { Login } from './pages/Login';

// Pages
import { Dashboard } from './pages/Dashboard';
import { BulkDispatcher } from './pages/BulkDispatcher';
import { Campaigns } from './pages/Campaigns';
import { SmtpClusters } from './pages/SmtpClusters';
import { ListsManagement } from './pages/ListsManagement';
import { Analytics } from './pages/Analytics';
import { Warmup } from './pages/Warmup';
import { Settings } from './pages/Settings';
import { Deliverability } from './pages/Deliverability';
import { EmailValidator } from './pages/EmailValidator';
import { LeadScraper } from './pages/LeadScraper';
import { CampaignBuilder } from './pages/CampaignBuilder';
import { Reports } from './pages/Reports';
import { ProTools } from './pages/ProTools';
import { SmtpManager } from './pages/SmtpManager';
import { BulkSender } from './pages/BulkSender';

export const App: React.FC = () => {
  const { activeTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'campaigns': return <Campaigns />;
      case 'campaign_builder': return <CampaignBuilder />;
      case 'smtp_clusters': return <SmtpClusters />;
      case 'smtp_manager': return <SmtpManager />;
      case 'lists_management': return <ListsManagement />;
      case 'bulk_dispatcher': return <BulkDispatcher />;
      case 'bulk_sender': return <BulkSender />;
      case 'email_validator': return <EmailValidator />;
      case 'lead_scraper': return <LeadScraper />;
      case 'analytics': return <Analytics />;
      case 'reports': return <Reports />;
      case 'warmup': return <Warmup />;
      case 'deliverability': return <Deliverability />;
      case 'pro_tools': return <ProTools />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 antialiased overflow-hidden selection:bg-purple-600 selection:text-white transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <Header />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
