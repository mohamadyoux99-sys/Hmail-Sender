import { DnsCheckResult, BlacklistCheckResult, EmailHeaderAnalysis } from '../types';

const MAJOR_RBLS = [
  'zen.spamhaus.org',
  'b.barracudacentral.org',
  'bl.spamcop.net',
  'dnsbl.sorbs.net',
  'cbl.abuseat.org',
  'psbl.surriel.com',
  'dul.dnsbl.sorbs.net',
  'ubl.unsubscore.com',
  'dnsbl-1.uceprotect.net',
  'truncate.gbudb.net',
  'spam.dnsbl.anonmails.de',
  'rbl.interserver.net',
  'ix.dnsbl.manitu.net',
  'db.wpbl.info',
  'spamsources.fabel.dk'
];

export async function checkDomainDns(domain: string): Promise<DnsCheckResult> {
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  
  // Simulated DNS lookup delay
  await new Promise(r => setTimeout(r, 200));

  const hasTld = cleanDomain.includes('.');
  const isHealthy = hasTld && !cleanDomain.includes('temp') && !cleanDomain.includes('test');

  const spfValid = isHealthy;
  const dkimValid = isHealthy;
  const dmarcValid = isHealthy;
  const mxValid = isHealthy;

  const score = (spfValid ? 25 : 0) + (dkimValid ? 25 : 0) + (dmarcValid ? 30 : 0) + (mxValid ? 20 : 0);

  return {
    domain: cleanDomain,
    spf: {
      valid: spfValid,
      record: spfValid ? `v=spf1 include:_spf.${cleanDomain} include:servers.mcsv.net ~all` : 'v=spf1 ?all (Permissive / Missing)',
      description: spfValid ? 'SPF record correctly specifies authorized sending IP ranges with soft-fail flag.' : 'No SPF record found or permissive (?all) configuration detected.',
    },
    dkim: {
      valid: dkimValid,
      selector: 'default._domainkey',
      record: dkimValid ? `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0...` : 'No DKIM public key published under selector "default".',
      description: dkimValid ? 'Valid 2048-bit RSA DKIM signature key found.' : 'DKIM record is missing. Messages may fail cryptographic signature verification.',
    },
    dmarc: {
      valid: dmarcValid,
      record: dmarcValid ? `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@${cleanDomain}; pct=100; sp=quarantine` : 'v=DMARC1; p=none; (Monitoring only - No enforcement)',
      policy: dmarcValid ? 'quarantine' : 'none',
      description: dmarcValid ? 'DMARC policy set to quarantine unauthorized messages with 100% enforcement.' : 'DMARC is not enforcing rejection of forged sender emails.',
    },
    mx: {
      valid: mxValid,
      records: mxValid ? [
        { host: `aspmx.l.google.com`, priority: 1 },
        { host: `alt1.aspmx.l.google.com`, priority: 5 },
        { host: `alt2.aspmx.l.google.com`, priority: 5 },
      ] : [],
    },
    score,
  };
}

export async function checkBlacklists(hostOrIp: string): Promise<BlacklistCheckResult> {
  const cleanTarget = hostOrIp.trim();
  
  await new Promise(r => setTimeout(r, 300));

  const results = MAJOR_RBLS.map((rbl) => {
    // 95% chance clean for standard domains
    const isListed = cleanTarget.toLowerCase().includes('spam') || (Math.random() < 0.05);
    return {
      rbl,
      isListed,
      responseTimeMs: Math.floor(Math.random() * 45 + 15),
    };
  });

  const listedCount = results.filter(r => r.isListed).length;

  return {
    hostOrIp: cleanTarget,
    listedCount,
    totalChecked: results.length,
    results,
  };
}

export async function analyzeEmailHeader(rawHeaders: string): Promise<EmailHeaderAnalysis> {
  await new Promise(r => setTimeout(r, 150));

  const hasSpfPass = /spf=pass/i.test(rawHeaders);
  const hasDkimPass = /dkim=pass/i.test(rawHeaders);
  const hasDmarcPass = /dmarc=pass/i.test(rawHeaders);
  const hasTls = /TLSv1\.[23]/i.test(rawHeaders);

  // Extract IP if present
  const ipMatch = rawHeaders.match(/\[([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\]/);
  const originIp = ipMatch ? ipMatch[1] : '198.51.100.42';

  let spamScore = 0.5; // low is good
  const recommendations: string[] = [];

  if (!hasSpfPass) {
    spamScore += 2.5;
    recommendations.push('SPF authentication header is not marked as PASS. Verify your SPF TXT records.');
  }
  if (!hasDkimPass) {
    spamScore += 2.5;
    recommendations.push('DKIM signature was not verified. Ensure your outbound mail server is signing emails.');
  }
  if (!hasDmarcPass) {
    spamScore += 1.5;
    recommendations.push('DMARC alignment check failed or is missing.');
  }
  if (!hasTls) {
    spamScore += 1.0;
    recommendations.push('Email transmission did not use modern TLS 1.2+ encryption.');
  }

  if (recommendations.length === 0) {
    recommendations.push('All email authentication headers (SPF, DKIM, DMARC, TLS) are pristine and fully aligned.');
  }

  return {
    rawHeaders,
    spamScore: Math.min(10, Math.max(0.1, spamScore)),
    spfResult: hasSpfPass ? 'PASS' : 'FAIL',
    dkimResult: hasDkimPass ? 'PASS' : 'FAIL',
    dmarcResult: hasDmarcPass ? 'PASS' : 'FAIL',
    originIp,
    originCountry: 'United States',
    tlsVersion: hasTls ? 'TLSv1.3 (ChaCha20-Poly1305)' : 'TLSv1.2 (ECDHE-RSA-AES128-GCM-SHA256)',
    recommendations,
  };
}

export function generateSmtpConfigCode(
  host: string, 
  port: number, 
  user: string, 
  fromEmail: string
) {
  return {
    nodemailer: `// Node.js / Nodemailer Configuration
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '${host || 'smtp.example.com'}',
  port: ${port || 587},
  secure: ${port === 465}, // true for 465, false for 587
  auth: {
    user: '${user || 'user@example.com'}',
    pass: 'YOUR_SECURE_PASSWORD'
  },
  pool: true,
  maxConnections: 5,
  rateLimit: 10
});

// Verify connection
transporter.verify((error, success) => {
  if (error) console.error('SMTP Connection Failed:', error);
  else console.log('SMTP Server is ready to send messages!');
});`,
    python: `# Python smtplib & email configuration
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = "${host || 'smtp.example.com'}"
SMTP_PORT = ${port || 587}
SMTP_USER = "${user || 'user@example.com'}"
SMTP_PASS = "YOUR_SECURE_PASSWORD"

server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
server.starttls()
server.login(SMTP_USER, SMTP_PASS)
print("SMTP authenticated successfully!")`,
    postfix: `# /etc/postfix/main.cf relayhost config
relayhost = [${host || 'smtp.example.com'}]:${port || 587}
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_security_options = noanonymous
smtp_tls_security_level = encrypt
smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt`,
  };
}
