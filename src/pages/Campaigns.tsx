import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Megaphone, Plus, Edit3, Copy, Trash2, Play, Eye, CheckCircle2,
  Clock, X, Code, Sparkles, Send, Mail, Loader2, Radio, Monitor,
  Smartphone, FileText, Users, ChevronRight, AlertCircle, Save
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Campaign } from '../types';
import { sendRealTestEmail } from '../services/apiService';

const TEMPLATES = [
  {
    id: 'tpl-cold', name: 'Cold Outreach', category: 'Cold',
    subject: '{Hi|Hello|Hey} {{name}}, quick question about {{company}}',
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b;line-height:1.7;">
  <p>{Hi|Hello|Hey} {{name}},</p>
  <p>I came across <b>{{company}}</b> and was impressed by what you're building.</p>
  <p>{I'd love to explore a potential partnership.|Would you be open to a quick 15-minute chat?|Let me know if there's a good time to connect.}</p>
  <p>Best regards,<br><b>The HMailInbox Team</b></p>
</div>`
  },
  {
    id: 'tpl-newsletter', name: 'Newsletter', category: 'Newsletter',
    subject: 'Weekly Digest — {{date}}',
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b;">
  <h2 style="color:#7c3aed;">Weekly Newsletter</h2>
  <p>Hi {{name}},</p>
  <p>Here are this week's top updates for <b>{{company}}</b>:</p>
  <ul>
    <li>Feature update: AI-powered campaign builder</li>
    <li>Performance benchmark: 98.7% delivery rate</li>
    <li>New integration: Zapier & Webhooks</li>
  </ul>
  <p>Stay tuned for more!</p>
</div>`
  },
  {
    id: 'tpl-promo', name: 'Promotional Offer', category: 'Promo',
    subject: 'Exclusive Offer for {{company}} — Limited Time',
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b;">
  <h2 style="color:#dc2626;">Special Offer Just for You</h2>
  <p>Hi {{name}},</p>
  <p>As a valued contact at <b>{{company}}</b>, we're offering you an exclusive 40% discount.</p>
  <p style="text-align:center;margin:30px 0;">
    <a href="#" style="background:#7c3aed;color:#fff;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:bold;">Claim Your Discount</a>
  </p>
  <p style="color:#64748b;font-size:12px;">Offer expires in 48 hours.</p>
</div>`
  },
  {
    id: 'tpl-followup', name: 'Follow-Up', category: 'Follow-Up',
    subject: 'Following up — {{name}}',
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b;">
  <p>Hi {{name}},</p>
  <p>Just following up on my previous email regarding <b>{{company}}</b>.</p>
  <p>{I understand you're busy — would next week work for a quick call?|I'd love to hear your thoughts when you get a chance.}</p>
  <p>Best,<br><b>The HMailInbox Team</b></p>
</div>`
  },
];

export const Campaigns: React.FC = () => {
  const { t } = useTranslation();
  const {
    campaigns, smtps, lists,
    saveCampaign, duplicateCampaign, deleteCampaign,
    startDispatch, isDispatching, dispatchProgress,
    terminalLogs, showToast
  } = useApp();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Send to single email
  const [sendSingleModal, setSendSingleModal] = useState<Campaign | null>(null);
  const [singleEmail, setSingleEmail] = useState('');
  const [singleSmtpId, setSingleSmtpId] = useState(smtps[0]?.id || '');
  const [isSendingSingle, setIsSendingSingle] = useState(false);

  // Send to group
  const [sendGroupModal, setSendGroupModal] = useState<Campaign | null>(null);
  const [groupListId, setGroupListId] = useState('');
  const [groupManualEmails, setGroupManualEmails] = useState('');
  const [groupSmtpIds, setGroupSmtpIds] = useState<string[]>(smtps.filter(s => s.status === 'active').map(s => s.id));
  const [groupMinDelay, setGroupMinDelay] = useState(2);
  const [groupMaxDelay, setGroupMaxDelay] = useState(5);

  // ─── Campaign CRUD ──────────────────────────────────────────────────────────
  const handleOpenCreate = (template?: typeof TEMPLATES[0]) => {
    const tpl = template || TEMPLATES[0];
    setSelectedTemplateId(tpl.id);
    setEditingCampaign({
      id: 'camp-' + Date.now(),
      name: '',
      senderName: 'HMailInbox Team',
      fromEmail: smtps[0]?.fromEmail || 'sender@hmailinbox.com',
      replyTo: smtps[0]?.fromEmail || '',
      subject: tpl.subject,
      bodyHtml: tpl.bodyHtml,
      status: 'draft',
      totalRecipients: 0,
      sentCount: 0, deliveredCount: 0, openedCount: 0, clickedCount: 0, bouncedCount: 0,
      smtpIds: smtps.map(s => s.id),
      delayMinSeconds: 2, delayMaxSeconds: 5,
      enableTrackingPixel: true, enableClickTracking: true,
      createdAt: new Date().toISOString().substring(0, 10),
    });
    setIsModalOpen(true);
    setShowPreviewMode(false);
  };

  const handleOpenEdit = (camp: Campaign) => {
    setEditingCampaign(camp);
    setSelectedTemplateId(null);
    setIsModalOpen(true);
    setShowPreviewMode(false);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign?.name || !editingCampaign?.subject) {
      showToast('Please fill in campaign name and subject', 'error');
      return;
    }
    saveCampaign(editingCampaign as Campaign);
    setIsModalOpen(false);
    setEditingCampaign(null);
    showToast(`Campaign "${editingCampaign.name}" saved!`, 'success');
  };

  const handleCopyCampaign = (camp: Campaign) => {
    duplicateCampaign(camp.id);
    showToast(`"${camp.name}" duplicated`, 'success');
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      const camp = campaigns.find(c => c.id === deleteConfirmId);
      deleteCampaign(deleteConfirmId);
      setDeleteConfirmId(null);
      showToast(`"${camp?.name}" deleted`, 'info');
    }
  };

  // ─── Send Single Email ──────────────────────────────────────────────────────
  const handleSendSingle = async () => {
    if (!singleEmail.trim() || !singleEmail.includes('@')) {
      showToast('Enter a valid email', 'error'); return;
    }
    if (!sendSingleModal) return;
    const smtp = smtps.find(s => s.id === singleSmtpId);
    if (!smtp) { showToast('Select an SMTP', 'error'); return; }

    let bodyHtml = sendSingleModal.bodyHtml || '';
    bodyHtml = bodyHtml.replace(/\{\{name\}\}/gi, singleEmail.split('@')[0]);
    bodyHtml = bodyHtml.replace(/\{\{company\}\}/gi, '');
    bodyHtml = bodyHtml.replace(/\{\{email\}\}/gi, singleEmail);

    let subject = sendSingleModal.subject || 'No Subject';
    subject = subject.replace(/\{\{name\}\}/gi, singleEmail.split('@')[0]);
    subject = subject.replace(/\{\{company\}\}/gi, '');

    setIsSendingSingle(true);
    const res = await sendRealTestEmail(smtp, singleEmail, subject, bodyHtml);
    setIsSendingSingle(false);
    if (res.success) {
      showToast(`Email sent to ${singleEmail}!`, 'success');
      setSendSingleModal(null);
      setSingleEmail('');
    } else {
      showToast(`Failed: ${res.message}`, 'error');
    }
  };

  // ─── Send to Group ──────────────────────────────────────────────────────────
  const handleSendGroup = async () => {
    if (!sendGroupModal) return;
    let recipients: Array<{ email: string; name: string; company?: string }> = [];

    if (groupListId) {
      const list = lists.find(l => l.id === groupListId);
      if (list) recipients = list.subscribers.map(s => ({ email: s.email, name: s.name, company: s.company }));
    } else {
      recipients = groupManualEmails.split('\n').map(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2 && parts[1]?.includes('@')) return { name: parts[0], email: parts[1], company: parts[2] || '' };
        return null;
      }).filter(Boolean) as Array<{ email: string; name: string; company?: string }>;
    }

    if (recipients.length === 0) { showToast('No recipients!', 'error'); return; }
    if (groupSmtpIds.length === 0) { showToast('Select at least one SMTP', 'error'); return; }

    const selectedSmtps = smtps.filter(s => groupSmtpIds.includes(s.id));
    const campaign = { ...sendGroupModal, smtpIds: groupSmtpIds, status: 'running' as const };

    setSendGroupModal(null);
    showToast(`Dispatching to ${recipients.length} recipients...`, 'success');
    await startDispatch(campaign, recipients, groupMinDelay, groupMaxDelay);
  };

  // ─── Preview Helpers ────────────────────────────────────────────────────────
  const renderPreview = (html: string) => {
    return html
      .replace(/\{\{name\}\}/g, '<span style="color:#7c3aed;font-weight:bold">John Doe</span>')
      .replace(/\{\{company\}\}/g, '<span style="color:#7c3aed;font-weight:bold">Acme Corp</span>')
      .replace(/\{\{email\}\}/g, '<span style="color:#7c3aed">john@acme.com</span>')
      .replace(/\{\{sender_name\}\}/g, '<span style="color:#7c3aed;font-weight:bold">HMailInbox Team</span>')
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
      .replace(/\{([^|}]+)\|([^}]+)\}/g, '<span style="color:#7c3aed;font-style:italic">[$1]</span>');
  };

  const recentLogs = terminalLogs.slice(-20).reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER                                                               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Campaigns Studio</h2>
          <p className="text-xs text-slate-400 mt-0.5">Create, manage, preview and launch campaigns with templates</p>
        </div>
        <div className="flex gap-2">
          {isDispatching && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold animate-pulse">
              <Radio className="w-3.5 h-3.5" /> SENDING
            </span>
          )}
          <button onClick={() => handleOpenCreate()} className="glass-btn-primary text-xs">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DISPATCH PROGRESS                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isDispatching && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">Sending Progress</span>
            <span className="text-xs font-bold text-white">{dispatchProgress.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-300" style={{ width: `${dispatchProgress.percentage}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Sent: {dispatchProgress.sent}/{dispatchProgress.total}</span>
            <span>Current: {dispatchProgress.currentEmail}</span>
            <span>SMTP: {dispatchProgress.currentSmtp}</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CAMPAIGNS TABLE                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Campaign</th>
                <th className="py-3 px-4 text-left">Sender</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Delivered</th>
                <th className="py-3 px-4 text-left">Opens</th>
                <th className="py-3 px-4 text-left">Clicks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white text-xs">{camp.name}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[250px]">{camp.subject}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <p className="font-medium">{camp.senderName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{camp.fromEmail}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                      camp.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400'
                      : camp.status === 'running' ? 'bg-cyan-500/15 text-cyan-400 animate-pulse'
                      : camp.status === 'stopped' ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-white/10 text-slate-400'
                    }`}>{camp.status}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-purple-400">{camp.deliveredCount}/{camp.totalRecipients}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{camp.openedCount}</td>
                  <td className="py-3.5 px-4 font-bold text-cyan-400">{camp.clickedCount}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview */}
                      <button onClick={() => { setPreviewCampaign(camp); setShowPreviewMode(false); }} className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors" title="Preview">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {/* Copy */}
                      <button onClick={() => handleCopyCampaign(camp)} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors" title="Copy Campaign">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {/* Edit */}
                      <button onClick={() => handleOpenEdit(camp)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Edit">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete */}
                      <button onClick={() => setDeleteConfirmId(camp.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Send Single */}
                      <button onClick={() => { setSendSingleModal(camp); setSingleEmail(''); }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Send to 1 email">
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      {/* Send Group */}
                      <button onClick={() => { setSendGroupModal(camp); setGroupListId(''); setGroupManualEmails(''); }} className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md shadow-purple-600/30 transition-all">
                        <Send className="w-2.5 h-2.5" /> Send
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center text-slate-500">
                  <Megaphone className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p>No campaigns yet. Create your first one!</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CREATE / EDIT MODAL                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-400" />
                {campaigns.some(c => c.id === editingCampaign.id) ? 'Edit Campaign' : 'Create Campaign'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Template Sidebar */}
              <div className="lg:col-span-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" /> Templates
                </h4>
                <div className="space-y-2">
                  {TEMPLATES.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setEditingCampaign(prev => prev ? { ...prev, subject: tpl.subject, bodyHtml: tpl.bodyHtml } : prev);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedTemplateId === tpl.id
                          ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/10'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{tpl.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">{tpl.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Campaign Title *</label>
                  <input value={editingCampaign.name || ''} onChange={e => setEditingCampaign({ ...editingCampaign, name: e.target.value })} placeholder="e.g. Q3 Sales Outreach" className="w-full glass-input text-xs" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Sender Name</label>
                    <input value={editingCampaign.senderName || ''} onChange={e => setEditingCampaign({ ...editingCampaign, senderName: e.target.value })} className="w-full glass-input text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">From Email</label>
                    <input value={editingCampaign.fromEmail || ''} onChange={e => setEditingCampaign({ ...editingCampaign, fromEmail: e.target.value })} className="w-full glass-input text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Subject Line * <span className="text-slate-500 font-normal normal-case">(supports spintax: {'{Hi|Hello}'} {'{{name}}'})</span></label>
                  <input value={editingCampaign.subject || ''} onChange={e => setEditingCampaign({ ...editingCampaign, subject: e.target.value })} className="w-full glass-input text-xs font-mono" required />
                </div>

                {/* Body / Preview Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Body HTML</label>
                  <button onClick={() => setShowPreviewMode(!showPreviewMode)} className={`text-[11px] px-3 py-1.5 rounded-lg font-semibold ${showPreviewMode ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                    {showPreviewMode ? <Code className="w-3.5 h-3.5 inline mr-1" /> : <Eye className="w-3.5 h-3.5 inline mr-1" />}
                    {showPreviewMode ? 'Edit HTML' : 'Live Preview'}
                  </button>
                </div>
                {showPreviewMode ? (
                  <div className="flex flex-col items-center">
                    <div className="flex gap-2 mb-3">
                      <button onClick={() => setPreviewDevice('desktop')} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${previewDevice === 'desktop' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Monitor className="w-3 h-3 inline mr-1" /> Desktop
                      </button>
                      <button onClick={() => setPreviewDevice('mobile')} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${previewDevice === 'mobile' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Smartphone className="w-3 h-3 inline mr-1" /> Mobile
                      </button>
                    </div>
                    <div className={`bg-white rounded-xl p-6 overflow-auto ${previewDevice === 'mobile' ? 'max-w-[320px]' : 'max-w-full w-full'}`}>
                      <div className="mb-3 pb-2 border-b border-gray-200">
                        <p className="text-[10px] text-gray-500">Subject: <span className="text-gray-800 font-semibold text-xs">{renderPreview(editingCampaign.subject || '')}</span></p>
                        <p className="text-[10px] text-gray-400 mt-1">From: {editingCampaign.senderName} &lt;{editingCampaign.fromEmail}&gt;</p>
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: renderPreview(editingCampaign.bodyHtml || '') }} className="text-sm text-gray-800" />
                    </div>
                  </div>
                ) : (
                  <textarea rows={10} value={editingCampaign.bodyHtml || ''} onChange={e => setEditingCampaign({ ...editingCampaign, bodyHtml: e.target.value })} className="w-full glass-input font-mono text-xs leading-relaxed resize-none" />
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-400">Cancel</button>
                  <button onClick={handleSaveModal} className="glass-btn-primary text-xs"><Save className="w-4 h-4" /> Save Campaign</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PREVIEW MODAL                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {previewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreviewCampaign(null)}>
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-white">{previewCampaign.name}</h3>
                <p className="text-xs text-slate-400">{previewCampaign.subject}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSendSingleModal(previewCampaign); setPreviewCampaign(null); setSingleEmail(''); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20">
                  <Mail className="w-3.5 h-3.5" /> Send to 1
                </button>
                <button onClick={() => { setSendGroupModal(previewCampaign); setPreviewCampaign(null); setGroupListId(''); setGroupManualEmails(''); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold">
                  <Send className="w-3.5 h-3.5" /> Send to Group
                </button>
                <button onClick={() => setPreviewCampaign(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-xl p-6 max-w-full w-full">
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <p className="text-[10px] text-gray-500">Subject: <span className="text-gray-800 font-semibold">{renderPreview(previewCampaign.subject)}</span></p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: renderPreview(previewCampaign.bodyHtml) }} className="text-sm text-gray-800" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SEND TO SINGLE EMAIL MODAL                                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {sendSingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSendSingleModal(null)}>
          <div className="glass-card w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Mail className="w-5 h-5 text-amber-400" /> Send Single Email</h3>
              <button onClick={() => setSendSingleModal(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Campaign: <span className="text-white font-bold">{sendSingleModal.name}</span></p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">SMTP Account</label>
                <select value={singleSmtpId} onChange={e => setSingleSmtpId(e.target.value)} className="w-full glass-input text-xs">
                  {smtps.filter(s => s.status === 'active').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Recipient Email</label>
                <input type="email" value={singleEmail} onChange={e => setSingleEmail(e.target.value)} placeholder="recipient@example.com" className="w-full glass-input text-xs" />
              </div>
              <button onClick={handleSendSingle} disabled={isSendingSingle} className="w-full glass-btn-primary text-xs py-3">
                {isSendingSingle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSendingSingle ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SEND TO GROUP MODAL                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {sendGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSendGroupModal(null)}>
          <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Send className="w-5 h-5 text-purple-400" /> Send to Group</h3>
              <button onClick={() => setSendGroupModal(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Campaign: <span className="text-white font-bold">{sendGroupModal.name}</span></p>

            <div className="space-y-4">
              {/* Select List */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Select Mailing List</label>
                <select value={groupListId} onChange={e => setGroupListId(e.target.value)} className="w-full glass-input text-xs">
                  <option value="">— Paste emails manually —</option>
                  {lists.map(l => <option key={l.id} value={l.id}>{l.name} ({l.subscribersCount} contacts)</option>)}
                </select>
              </div>

              {/* Manual Emails */}
              {!groupListId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Or Paste Emails (name,email per line)</label>
                  <textarea value={groupManualEmails} onChange={e => setGroupManualEmails(e.target.value)} rows={5} placeholder={"John,john@example.com,Acme\nSarah,sarah@test.com"} className="w-full glass-input font-mono text-xs resize-none" />
                </div>
              )}

              {/* SMTP Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">SMTP Accounts</label>
                <div className="space-y-1.5">
                  {smtps.filter(s => s.status === 'active').map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                      <input type="checkbox" checked={groupSmtpIds.includes(s.id)} onChange={() => {
                        setGroupSmtpIds(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id]);
                      }} className="w-4 h-4 rounded bg-slate-700 text-purple-500" />
                      <span className="text-xs text-slate-200">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delay */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400">Min Delay (sec)</label>
                  <input type="number" value={groupMinDelay} onChange={e => setGroupMinDelay(parseInt(e.target.value) || 2)} className="w-full glass-input text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Max Delay (sec)</label>
                  <input type="number" value={groupMaxDelay} onChange={e => setGroupMaxDelay(parseInt(e.target.value) || 5)} className="w-full glass-input text-xs" />
                </div>
              </div>

              <button onClick={handleSendGroup} disabled={isDispatching} className="w-full glass-btn-primary text-xs py-3">
                {isDispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isDispatching ? 'Sending in progress...' : 'Start Sending'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
          <div className="glass-card w-full max-w-sm p-6 m-4 border-red-500/30" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete Campaign?</h3>
            <p className="text-xs text-slate-400 mb-4">This action cannot be undone. The campaign and all its data will be permanently removed.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-400">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500">Delete Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LIVE LOGS (bottom panel)                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {recentLogs.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-cyan-400" /> Live Activity Logs</h3>
            <span className="text-[10px] text-slate-500">{recentLogs.length} recent events</span>
          </div>
          <div className="max-h-48 overflow-y-auto p-2 space-y-1 bg-slate-950/60">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 px-2 py-1 text-[11px] font-mono">
                <span className="text-slate-500 shrink-0">{log.time}</span>
                <span className={`shrink-0 font-bold ${
                  log.level === 'SUCCESS' ? 'text-emerald-400'
                  : log.level === 'ERROR' ? 'text-red-400'
                  : log.level === 'WARN' ? 'text-amber-400'
                  : log.level === 'SMTP' ? 'text-purple-400'
                  : log.level === 'TRACK' ? 'text-cyan-400'
                  : 'text-slate-400'
                }`}>[{log.level}]</span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


