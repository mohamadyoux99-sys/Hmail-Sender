const API_BASE_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001/api`;

function getToken(): string | null {
  return localStorage.getItem('hmailinbox_token');
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem('hmailinbox_token');
    localStorage.removeItem('hmailinbox_user');
    window.location.reload();
    return data;
  }
  return data;
}

// Auth
export async function login(username: string, password: string) {
  try {
    return await apiRequest('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password })
    });
  } catch (err: any) {
    return { success: false, message: err.message || 'Login failed' };
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest('/auth/change-password', {
    method: 'POST', body: JSON.stringify({ currentPassword, newPassword })
  });
}

// SMTP
export async function fetchSmtps() {
  return apiRequest('/smtp');
}

export async function saveSmtp(smtp: any) {
  return apiRequest('/smtp', { method: 'POST', body: JSON.stringify(smtp) });
}

export async function deleteSmtp(id: string) {
  return apiRequest(`/smtp/${id}`, { method: 'DELETE' });
}

export async function testSmtpConnection(account: any) {
  try {
    return await apiRequest('/smtp/test-connection', {
      method: 'POST', body: JSON.stringify(account)
    });
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to reach backend' };
  }
}

export async function sendRealTestEmail(smtp: any, recipientEmail: string, subject?: string, bodyHtml?: string) {
  try {
    return await apiRequest('/smtp/send-test-email', {
      method: 'POST', body: JSON.stringify({ smtp, recipientEmail, subject, bodyHtml })
    });
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to send test email' };
  }
}

export async function reorderSmtps(orderedIds: string[]) {
  return apiRequest('/smtp/reorder', { method: 'POST', body: JSON.stringify({ orderedIds }) });
}

// Campaigns
export async function fetchCampaigns() {
  return apiRequest('/campaigns');
}

export async function saveCampaign(campaign: any) {
  return apiRequest('/campaigns', { method: 'POST', body: JSON.stringify(campaign) });
}

export async function deleteCampaign(id: string) {
  return apiRequest(`/campaigns/${id}`, { method: 'DELETE' });
}

export async function duplicateCampaign(id: string) {
  return apiRequest(`/campaigns/duplicate/${id}`, { method: 'POST' });
}

// Dispatch
export async function startBulkDispatch(campaign: any, smtps: any[], recipients: any[], minDelay = 2, maxDelay = 5) {
  try {
    return await apiRequest('/dispatch/start', {
      method: 'POST', body: JSON.stringify({ campaign, smtps, recipients, minDelay, maxDelay })
    });
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to start dispatch' };
  }
}

export async function stopBulkDispatch() {
  try {
    return await apiRequest('/dispatch/stop', { method: 'POST' });
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Lists
export async function fetchLists() {
  return apiRequest('/lists');
}

export async function saveList(list: any) {
  return apiRequest('/lists', { method: 'POST', body: JSON.stringify(list) });
}

export async function deleteList(id: string) {
  return apiRequest(`/lists/${id}`, { method: 'DELETE' });
}

// Warmup
export async function fetchWarmups() {
  return apiRequest('/warmup');
}

export async function saveWarmup(warmup: any) {
  return apiRequest('/warmup', { method: 'POST', body: JSON.stringify(warmup) });
}

export async function startWarmup(smtpId: string, smtpName: string, totalDays: number) {
  return apiRequest('/warmup/start', { method: 'POST', body: JSON.stringify({ smtpId, smtpName, totalDays }) });
}

export async function stopWarmup(id: string) {
  return apiRequest('/warmup/stop', { method: 'POST', body: JSON.stringify({ id }) });
}

// Stats
export async function fetchStats() {
  return apiRequest('/stats');
}

// Settings
export async function fetchSettings() {
  return apiRequest('/settings');
}

export async function saveSettings(settings: any) {
  return apiRequest('/settings', { method: 'POST', body: JSON.stringify(settings) });
}

// Activity
export async function fetchActivity() {
  return apiRequest('/activity');
}

// Validation
export async function validateEmails(emails: string[]) {
  return apiRequest('/validate', { method: 'POST', body: JSON.stringify({ emails }) });
}

// Scraper
export async function scrapeLeads(keyword: string, location: string, limit: number) {
  return apiRequest('/scraper', { method: 'POST', body: JSON.stringify({ keyword, location, limit }) });
}

// DNS
export async function checkDomainDns(domain: string) {
  return apiRequest('/dns-check', { method: 'POST', body: JSON.stringify({ domain }) });
}

// Config Generator
export async function generateSmtpConfig(host: string, port: number, user: string) {
  return apiRequest('/generate-config', { method: 'POST', body: JSON.stringify({ host, port, user }) });
}

// Export
export async function exportData(type: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/export/json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ type })
  });
  return res.json();
}
