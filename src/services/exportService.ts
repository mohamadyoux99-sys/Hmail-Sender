import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Campaign, LeadItem, ValidationResult, SmtpAccount } from '../types';

export function exportLeadsToExcel(leads: LeadItem[], filename: string = 'leads_export.xlsx') {
  const data = leads.map(l => ({
    'Name': l.name,
    'Company': l.company,
    'Email': l.email,
    'Phone': l.phone,
    'Website': l.website,
    'City': l.city,
    'Country': l.country,
    'Category': l.category,
    'Status': l.status,
    'Extracted Date': l.extractedAt
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  XLSX.writeFile(workbook, filename);
}

export function exportValidationToExcel(results: ValidationResult[], filename: string = 'validation_clean_list.xlsx') {
  const data = results.map(r => ({
    'Email': r.email,
    'Status': r.status,
    'Syntax Valid': r.syntaxValid ? 'YES' : 'NO',
    'MX Valid': r.mxValid ? 'YES' : 'NO',
    'SMTP Verified': r.smtpPingValid ? 'YES' : 'NO',
    'Disposable': r.isDisposable ? 'YES' : 'NO',
    'Catch-All': r.isCatchAll ? 'YES' : 'NO',
    'Deliverability Score': `${r.score}/100`,
    'Reason': r.reason
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Validation Report');
  XLSX.writeFile(workbook, filename);
}

export function exportCampaignsToExcel(campaigns: Campaign[], filename: string = 'campaigns_report.xlsx') {
  const data = campaigns.map(c => ({
    'Campaign Name': c.name,
    'Subject': c.subject,
    'Status': c.status,
    'Total Recipients': c.totalRecipients,
    'Sent Count': c.sentCount,
    'Delivered': c.deliveredCount,
    'Opened': c.openedCount,
    'Clicked': c.clickedCount,
    'Bounced': c.bouncedCount,
    'Open Rate': c.deliveredCount > 0 ? `${((c.openedCount / c.deliveredCount) * 100).toFixed(1)}%` : '0%',
    'Click Rate': c.deliveredCount > 0 ? `${((c.clickedCount / c.deliveredCount) * 100).toFixed(1)}%` : '0%',
    'Date Created': c.createdAt
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaigns');
  XLSX.writeFile(workbook, filename);
}

export function exportCampaignReportPdf(campaign: Campaign, smtps: SmtpAccount[]) {
  const doc = new jsPDF();

  // Header Title
  doc.setFillColor(14, 140, 228);
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Mailinboxapp — Campaign Performance Audit', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(220, 240, 255);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 140, 18);

  // Campaign Summary Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text(`Campaign: ${campaign.name}`, 14, 40);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Subject: "${campaign.subject}"`, 14, 48);
  doc.text(`Status: ${campaign.status.toUpperCase()} | Created: ${campaign.createdAt}`, 14, 54);

  // Key Metrics Table
  const openRate = campaign.deliveredCount > 0 ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1) + '%' : '0%';
  const clickRate = campaign.deliveredCount > 0 ? ((campaign.clickedCount / campaign.deliveredCount) * 100).toFixed(1) + '%' : '0%';
  const bounceRate = campaign.totalRecipients > 0 ? ((campaign.bouncedCount / campaign.totalRecipients) * 100).toFixed(1) + '%' : '0%';

  autoTable(doc, {
    startY: 62,
    head: [['Metric', 'Total Count', 'Conversion Rate']],
    body: [
      ['Total Targets', campaign.totalRecipients.toLocaleString(), '100%'],
      ['Delivered', campaign.deliveredCount.toLocaleString(), `${((campaign.deliveredCount / campaign.totalRecipients) * 100).toFixed(1)}%`],
      ['Unique Opens', campaign.openedCount.toLocaleString(), openRate],
      ['Link Clicks', campaign.clickedCount.toLocaleString(), clickRate],
      ['Bounces / Failures', campaign.bouncedCount.toLocaleString(), bounceRate],
    ],
    theme: 'grid',
    headStyles: { fillColor: [14, 140, 228], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  // Sending SMTPs section
  const nextY = (doc as any).lastAutoTable.finalY + 15;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.text('SMTP Infrastructure Used:', 14, nextY);

  const usedSmtps = smtps.filter(s => campaign.smtpIds.includes(s.id));
  const smtpRows = usedSmtps.map(s => [
    s.name,
    s.host,
    s.port.toString(),
    s.fromEmail,
    `${s.healthScore}/100`
  ]);

  autoTable(doc, {
    startY: nextY + 6,
    head: [['Account Name', 'Host', 'Port', 'From Email', 'Health Score']],
    body: smtpRows.length > 0 ? smtpRows : [['All Smtp Accounts Pool', 'smtp.cluster.relay', '587', 'multi-sender', '98/100']],
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  doc.save(`Campaign_Report_${campaign.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
