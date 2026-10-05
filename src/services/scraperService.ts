import { LeadItem } from '../types';
import { validateSingleEmail } from './validatorService';

const FIRST_NAMES = [
  'James', 'Sarah', 'Alex', 'Fatima', 'Omar', 'Elena', 'David', 'Layla', 
  'Michael', 'Nadia', 'Lucas', 'Marcus', 'Amina', 'John', 'Sophia', 'Tariq'
];

const LAST_NAMES = [
  'Miller', 'Al-Mansoor', 'Vance', 'Smith', 'Haddad', 'Lindqvist', 'Chen', 
  'Dubois', 'Kowalski', 'Al-Zaidi', 'Taylor', 'Schmidt', 'Bernard', 'O’Connor'
];

const DOMAIN_SUFFIXES = ['.com', '.io', '.co', '.ae', '.net', '.sa', '.tech', '.agency', '.org'];

export async function scrapeBusinessLeads(
  keyword: string,
  location: string,
  limit: number = 20,
  autoValidate: boolean = true,
  onProgress?: (count: number, total: number) => void
): Promise<LeadItem[]> {
  const cleanKeyword = keyword.trim() || 'Software Company';
  const cleanLocation = location.trim() || 'Dubai, UAE';
  const results: LeadItem[] = [];

  const sanitizedKeyword = cleanKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (let i = 0; i < limit; i++) {
    // Simulated realistic delay for web directory scraping / puppeteer crawl
    await new Promise(r => setTimeout(r, 80));

    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const suffix = DOMAIN_SUFFIXES[Math.floor(Math.random() * DOMAIN_SUFFIXES.length)];
    
    const companyBase = `${sanitizedKeyword}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');
    const company = `${lastName} & Partners ${cleanKeyword.split(' ')[0] || 'Group'}`;
    const domain = `${companyBase}${suffix}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`.replace(/[']/g, '');
    const website = `https://www.${domain}`;
    
    // Generate realistic phone number
    const areaCode = Math.floor(Math.random() * 800 + 100);
    const phoneMid = Math.floor(Math.random() * 899 + 100);
    const phoneEnd = Math.floor(Math.random() * 8999 + 1000);
    const phone = `+1 (${areaCode}) ${phoneMid}-${phoneEnd}`;

    let isValid = true;
    let status: 'valid' | 'risky' | 'invalid' | 'unverified' = 'unverified';

    if (autoValidate) {
      const val = await validateSingleEmail(email);
      isValid = val.status === 'valid';
      status = val.status === 'valid' ? 'valid' : val.status === 'catch_all' ? 'risky' : 'invalid';
    }

    const lead: LeadItem = {
      id: 'lead-' + Date.now() + '-' + i,
      name: `${firstName} ${lastName}`,
      company,
      email,
      phone,
      website,
      city: cleanLocation.split(',')[0].trim(),
      country: cleanLocation.includes(',') ? cleanLocation.split(',')[1].trim() : 'Global',
      category: cleanKeyword,
      isValidated: autoValidate,
      status,
      extractedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    results.push(lead);

    if (onProgress) {
      onProgress(i + 1, limit);
    }
  }

  return results;
}
