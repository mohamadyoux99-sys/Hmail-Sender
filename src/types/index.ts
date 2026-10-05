export type NavTab =
  | 'dashboard'
  | 'campaigns'
  | 'campaign_builder'
  | 'smtp_clusters'
  | 'smtp_manager'
  | 'lists_management'
  | 'bulk_dispatcher'
  | 'bulk_sender'
  | 'email_validator'
  | 'lead_scraper'
  | 'analytics'
  | 'reports'
  | 'warmup'
  | 'deliverability'
  | 'pro_tools'
  | 'settings';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
}

export interface SmtpAccount {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  dailyLimit: number;
  sentToday: number;
  status: 'active' | 'paused' | 'warming' | 'error';
  healthScore: number;
  createdAt: string;
  lastTested?: string;
  lastTestSuccess?: boolean;
  lastUsed?: string;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  company?: string;
  status?: 'active' | 'bounced' | 'unsubscribed';
  addedAt: string;
}

export interface MailingList {
  id: string;
  name: string;
  description?: string;
  subscribers: Subscriber[];
  subscribersCount: number;
  ispBreakdown: {
    gmail: number;
    outlook: number;
    yahoo: number;
    other: number;
  };
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  senderName: string;
  fromEmail: string;
  replyTo: string;
  subject: string;
  bodyHtml: string;
  status: 'draft' | 'running' | 'completed' | 'stopped';
  listId?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  smtpIds: string[];
  delayMinSeconds: number;
  delayMaxSeconds: number;
  enableTrackingPixel: boolean;
  enableClickTracking: boolean;
  enableUnsubscribe?: boolean;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TerminalLog {
  id: string;
  time: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'SMTP' | 'TRACK';
  message: string;
  metadata?: any;
}

export interface WarmupSchedule {
  id: string;
  smtpId: string;
  smtpName: string;
  status: 'running' | 'paused' | 'completed';
  currentDay: number;
  totalDays: number;
  todayTarget: number;
  todaySent: number;
  inboxRate: number;
  spamRate: number;
  rampSchedule: number[];
  startedAt: string;
}

export interface LicenseInfo {
  isActivated: boolean;
  licenseKey: string;
  licenseeName: string;
  edition: string;
  expiresAt: string;
  maxSmtpAccounts: number;
  unlimitedSending: boolean;
}

// Additional helper types
export interface LeadItem {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  country: string;
  category: string;
  isValidated: boolean;
  status: 'valid' | 'risky' | 'invalid' | 'unverified';
  extractedAt: string;
}

export interface ValidationResult {
  id: string;
  email: string;
  status: 'valid' | 'invalid' | 'disposable' | 'catch_all' | 'syntax_error';
  syntaxValid: boolean;
  mxValid: boolean;
  smtpPingValid: boolean;
  isDisposable: boolean;
  isCatchAll: boolean;
  score: number;
  reason: string;
  validatedAt: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  category: 'cold_outreach' | 'newsletter' | 'promotional' | 'transactional';
  subject: string;
  bodyHtml: string;
  previewText: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  module: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'error';
  details?: string;
}

export interface DnsCheckResult {
  domain: string;
  spf: { valid: boolean; record: string; description: string; };
  dkim: { valid: boolean; selector: string; record: string; description: string; };
  dmarc: { valid: boolean; record: string; policy: 'none' | 'quarantine' | 'reject' | 'missing'; description: string; };
  mx: { valid: boolean; records: Array<{ host: string; priority: number }>; };
  score: number;
}

export interface BlacklistCheckResult {
  hostOrIp: string;
  listedCount: number;
  totalChecked: number;
  results: Array<{ rbl: string; isListed: boolean; responseTimeMs: number; }>;
}

export interface EmailHeaderAnalysis {
  rawHeaders: string;
  spamScore: number;
  spfResult: 'PASS' | 'FAIL' | 'NEUTRAL' | 'NONE';
  dkimResult: 'PASS' | 'FAIL' | 'NONE';
  dmarcResult: 'PASS' | 'FAIL' | 'NONE';
  originIp: string;
  originCountry: string;
  tlsVersion: string;
  recommendations: string[];
}
