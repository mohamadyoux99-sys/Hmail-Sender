import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Save,
  Eye,
  Code,
  Monitor,
  Smartphone,
  Sparkles,
  Copy,
  Trash2,
  Plus,
  Mail
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { TemplateItem } from '../types';

const defaultTemplates: TemplateItem[] = [
  {
    id: 'tpl-1', name: 'Cold Outreach', category: 'cold_outreach',
    subject: '{Hi|Hello|Hey} {{name}}, quick question about {{company}}',
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b;line-height:1.6;">
  <p>{Hi|Hello|Hey} {{name}},</p>
  <p>I came across {{company}} and was impressed by what you're building.</p>
  <p>{I'd love to explore a potential partnership.|Would you be open to a quick chat?|Let me know if there's a good time to connect.}</p>
  <p>Best,<br><strong>{{sender_name}}</strong></p>
</div>`,
    previewText: 'Personalized cold outreach with spintax',
  },
  {
    id: 'tpl-2', name: 'Newsletter', category: 'newsletter',
    subject: 'Weekly Digest — {{date}}',
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b;">
  <h2 style="color:#7c3aed;">Weekly Newsletter</h2>
  <p>Hi {{name}},</p>
  <p>Here are this week's top updates for {{company}}:</p>
  <ul>
    <li>Feature update: AI-powered campaign builder</li>
    <li>Performance benchmark: 98.7% delivery rate</li>
    <li>New integration: Zapier & Webhooks</li>
  </ul>
  <p>Stay tuned for more!</p>
</div>`,
    previewText: 'Weekly newsletter template',
  },
  {
    id: 'tpl-3', name: 'Promotional', category: 'promotional',
    subject: '🔥 Exclusive Offer for {{company}} — Limited Time',
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b;">
  <h2 style="color:#dc2626;">Special Offer Just for You</h2>
  <p>Hi {{name}},</p>
  <p>As a valued contact at {{company}}, we're offering you an exclusive 40% discount on our Pro plan.</p>
  <p style="text-align:center;margin:30px 0;">
    <a href="#" style="background:#7c3aed;color:#fff;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:bold;">Claim Your Discount</a>
  </p>
  <p style="color:#64748b;font-size:12px;">Offer expires in 48 hours. No spam, ever.</p>
</div>`,
    previewText: 'Promotional offer template',
  },
];

export const CampaignBuilder: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useApp();

  const [templates, setTemplates] = useState<TemplateItem[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [customName, setCustomName] = useState('');

  const handleSelectTemplate = (tpl: TemplateItem) => {
    setSelectedTemplate(tpl);
    setCustomSubject(tpl.subject);
    setCustomBody(tpl.bodyHtml);
    setCustomName(tpl.name);
    showToast(`Template "${tpl.name}" loaded`, 'info');
  };

  const handleSaveTemplate = () => {
    if (!customName.trim()) return showToast('Enter a template name', 'error');
    const newTpl: TemplateItem = {
      id: 'tpl-' + Date.now(),
      name: customName,
      category: selectedTemplate?.category || 'cold_outreach',
      subject: customSubject,
      bodyHtml: customBody,
      previewText: customSubject,
    };
    setTemplates(prev => [...prev, newTpl]);
    showToast('Template saved!', 'success');
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) setSelectedTemplate(null);
    showToast('Template deleted', 'info');
  };

  const renderPreview = (html: string) => {
    let processed = html
      .replace(/\{\{name\}\}/g, '<span style="color:#7c3aed;font-weight:bold">John Doe</span>')
      .replace(/\{\{company\}\}/g, '<span style="color:#7c3aed;font-weight:bold">Acme Corp</span>')
      .replace(/\{\{email\}\}/g, '<span style="color:#7c3aed">john@acme.com</span>')
      .replace(/\{\{sender_name\}\}/g, '<span style="color:#7c3aed;font-weight:bold">Alex Rivers</span>')
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
      .replace(/\{([^|}]+)\|([^}]+)\}/g, '<span style="color:#7c3aed;font-style:italic">[$1]</span>');
    return processed;
  };

  const categoryColors: Record<string, string> = {
    cold_outreach: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    newsletter: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    promotional: 'bg-red-500/10 text-red-400 border-red-500/30',
    transactional: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('campaignBuilder.title')}</h2>
        <p className="text-sm text-slate-300 mt-1">{t('campaignBuilder.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Library */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> {t('campaignBuilder.templateLibrary')}
            </h3>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTemplate?.id === tpl.id
                      ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{tpl.name}</span>
                    <div className="flex gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${categoryColors[tpl.category]}`}>
                        {tpl.category.replace('_', ' ')}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id); }}
                        className="p-0.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{tpl.previewText}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{selectedTemplate ? `Editing: ${selectedTemplate.name}` : 'New Template'}</h3>
              <div className="flex gap-2">
                <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${isPreviewMode ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                  {isPreviewMode ? <Code className="w-4 h-4 inline mr-1" /> : <Eye className="w-4 h-4 inline mr-1" />}
                  {isPreviewMode ? 'Edit' : t('campaignBuilder.previewMode')}
                </button>
                <button onClick={handleSaveTemplate} className="glass-btn-primary text-xs">
                  <Save className="w-4 h-4" /> {t('campaignBuilder.saveTemplate')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Template Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full glass-input text-sm"
                placeholder="My Custom Template"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Subject Line (supports spintax)</label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full glass-input text-sm font-mono"
                placeholder="{Hi|Hello} {{name}}"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Body HTML</label>
              <textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                className="w-full h-64 glass-input text-sm font-mono resize-none"
                placeholder="<p>Hello {{name}},</p>"
              />
            </div>
          </div>

          {/* Preview */}
          {isPreviewMode && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${previewDevice === 'desktop' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'}`}
                >
                  <Monitor className="w-4 h-4 inline mr-1" /> {t('campaignBuilder.desktopView')}
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${previewDevice === 'mobile' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'}`}
                >
                  <Smartphone className="w-4 h-4 inline mr-1" /> {t('campaignBuilder.mobileView')}
                </button>
              </div>
              <div className={`bg-white rounded-xl p-6 mx-auto overflow-auto ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-full'}`}>
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <p className="text-xs text-gray-500">Subject: <span className="text-gray-800 font-semibold">{renderPreview(customSubject)}</span></p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: renderPreview(customBody) }} className="text-sm text-gray-800" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
