import { SmtpAccount, Campaign, MailingList } from '../types';

export class DbManager {
  // Local storage wrapper
  static getSmtps(): SmtpAccount[] {
    const raw = localStorage.getItem('disp_smtps');
    return raw ? JSON.parse(raw) : [];
  }
}
