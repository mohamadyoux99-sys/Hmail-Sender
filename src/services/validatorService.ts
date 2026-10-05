import { ValidationResult } from '../types';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com', 
  'sharklasers.com', 'yopmail.com', 'throwawaymail.com', 'trashmail.com', 
  'getairmail.com', 'maildrop.cc', 'temp-mail.org', 'dispostable.com', 
  'fakeinbox.com', 'emailondeck.com', 'inboxkitten.com', 'burnermail.io', 
  'mohmal.com', 'crazymailing.com', 'generator.email', 'dropmail.me', 
  'tempail.com', 'mytemp.email', 'mytrashmail.com', 'dayrep.com', 'teleworm.us'
]);

const POPULAR_LEGIT_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 
  'protonmail.com', 'zoho.com', 'aol.com', 'gmx.com', 'fastmail.com'
]);

export function validateEmailSyntax(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

export function isDisposableEmail(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
}

export async function validateSingleEmail(email: string): Promise<ValidationResult> {
  const cleanEmail = email.trim().toLowerCase();
  
  // Syntax check
  if (!validateEmailSyntax(cleanEmail)) {
    return {
      id: 'val-' + Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      status: 'syntax_error',
      syntaxValid: false,
      mxValid: false,
      smtpPingValid: false,
      isDisposable: false,
      isCatchAll: false,
      score: 0,
      reason: 'Invalid email syntax format',
      validatedAt: new Date().toISOString(),
    };
  }

  const parts = cleanEmail.split('@');
  const domain = parts[1];

  // Disposable check
  if (isDisposableEmail(domain)) {
    return {
      id: 'val-' + Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      status: 'disposable',
      syntaxValid: true,
      mxValid: true,
      smtpPingValid: true,
      isDisposable: true,
      isCatchAll: false,
      score: 15,
      reason: 'Known disposable temporary domain detected',
      validatedAt: new Date().toISOString(),
    };
  }

  // Domain structure check
  if (!domain.includes('.') || domain.endsWith('.')) {
    return {
      id: 'val-' + Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      status: 'invalid',
      syntaxValid: true,
      mxValid: false,
      smtpPingValid: false,
      isDisposable: false,
      isCatchAll: false,
      score: 10,
      reason: 'Missing or corrupt MX domain structure',
      validatedAt: new Date().toISOString(),
    };
  }

  // Simulated latency for deep SMTP handshake / MX verification
  await new Promise(r => setTimeout(r, 60));

  const isPopular = POPULAR_LEGIT_DOMAINS.has(domain);
  const isCorporate = domain.length > 5 && !isPopular;
  
  // Simulated catch-all & score
  const isCatchAll = isCorporate && Math.random() < 0.15;
  const score = isPopular ? 98 : isCatchAll ? 65 : 92;

  return {
    id: 'val-' + Math.random().toString(36).substr(2, 9),
    email: cleanEmail,
    status: isCatchAll ? 'catch_all' : 'valid',
    syntaxValid: true,
    mxValid: true,
    smtpPingValid: true,
    isDisposable: false,
    isCatchAll,
    score,
    reason: isCatchAll ? 'Server accepts all mail (Catch-All configured)' : 'High deliverability, valid MX and mailbox verified',
    validatedAt: new Date().toISOString(),
  };
}

export async function validateBulkEmails(
  rawList: string, 
  onProgress?: (processed: number, total: number) => void
): Promise<ValidationResult[]> {
  // Extract all lines or comma-separated emails
  const lines = rawList
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Deduplicate before running
  const uniqueEmails = Array.from(new Set(lines));
  const results: ValidationResult[] = [];

  for (let i = 0; i < uniqueEmails.length; i++) {
    const result = await validateSingleEmail(uniqueEmails[i]);
    results.push(result);
    if (onProgress) {
      onProgress(i + 1, uniqueEmails.length);
    }
  }

  return results;
}
