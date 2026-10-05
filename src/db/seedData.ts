import { SmtpAccount, Campaign, MailingList } from '../types';

export const INITIAL_SMTPS: SmtpAccount[] = [
  {
    id: 'smtp-1',
    name: 'Google Workspace Relay',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    username: 'outreach@growthcorp.com',
    password: '',
    fromEmail: 'alex@growthcorp.com',
    fromName: 'Alex Rivers | GrowthCorp',
    replyTo: 'alex@growthcorp.com',
    dailyLimit: 2000,
    sentToday: 480,
    status: 'active',
    healthScore: 98,
    createdAt: '2026-08-01',
    lastTested: 'Just now',
    lastTestSuccess: true,
  }
];
