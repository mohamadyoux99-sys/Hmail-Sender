import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users, Plus, Trash2, Eye, Send, Upload, X, FileSpreadsheet,
  BarChart2, FileText, Edit3, CheckSquare, Square, Mail, Loader2,
  Download, Search, ArrowLeft, Copy
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { MailingList, Subscriber } from '../types';
import { sendRealTestEmail } from '../services/apiService';

export const ListsManagement: React.FC = () => {
  const { t } = useTranslation();
  const { lists, saveList, deleteList, setActiveTab, showToast, smtps } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // List CRUD state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<MailingList | null>(null);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [rawText, setRawText] = useState('');

  // Preview state
  const [previewList, setPreviewList] = useState<MailingList | null>(null);
  const [selectedSubIds, setSelectedSubIds] = useState<Set<string>>(new Set());

  // Test email state
  const [testEmailModal, setTestEmailModal] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testSmtpId, setTestSmtpId] = useState(smtps[0]?.id || '');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Create List ────────────────────────────────────────────────────────────
  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) { showToast('Please enter a list name', 'error'); return; }

    const subs = parseSubscribers(rawText);
    const newList: MailingList = {
      id: 'list-' + Date.now(),
      name: listName,
      description: listDescription,
      subscribers: subs,
      subscribersCount: subs.length,
      ispBreakdown: calcIspBreakdown(subs),
      createdAt: new Date().toISOString().substring(0, 10),
    };
    saveList(newList);
    setIsCreateModalOpen(false);
    resetForm();
    showToast(`List "${listName}" created with ${subs.length} contacts`, 'success');
  };

  // ─── Edit List ──────────────────────────────────────────────────────────────
  const handleOpenEdit = (list: MailingList) => {
    setEditingList(list);
    setListName(list.name);
    setListDescription(list.description || '');
    setRawText(list.subscribers.map(s => `${s.name},${s.email},${s.company || ''}`).join('\n'));
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingList) return;
    const subs = parseSubscribers(rawText);
    const updated: MailingList = {
      ...editingList,
      name: listName,
      description: listDescription,
      subscribers: subs,
      subscribersCount: subs.length,
      ispBreakdown: calcIspBreakdown(subs),
    };
    saveList(updated);
    setIsEditModalOpen(false);
    setEditingList(null);
    resetForm();
    showToast(`List updated — ${subs.length} contacts`, 'success');
  };

  // ─── Delete Single List ─────────────────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const handleDelete = () => {
    if (deleteConfirmId) {
      const list = lists.find(l => l.id === deleteConfirmId);
      deleteList(deleteConfirmId);
      setDeleteConfirmId(null);
      showToast(`"${list?.name}" deleted`, 'info');
    }
  };

  // ─── CSV Upload ─────────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRawText(prev => prev ? prev + '\n' + text : text);
      showToast(`Imported ${text.split('\n').filter(l => l.includes('@')).length} emails from file`, 'success');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRawText(prev => prev ? prev + '\n' + text : text);
      showToast(`Imported emails from dropped file`, 'success');
    };
    reader.readAsText(file);
  };

  // ─── Subscriber Management (inside preview modal) ───────────────────────────
  const toggleSubSelection = (subId: string) => {
    setSelectedSubIds(prev => {
      const next = new Set(prev);
      next.has(subId) ? next.delete(subId) : next.add(subId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!previewList) return;
    if (selectedSubIds.size === previewList.subscribers.length) {
      setSelectedSubIds(new Set());
    } else {
      setSelectedSubIds(new Set(previewList.subscribers.map(s => s.id)));
    }
  };

  const deleteSelectedSubs = () => {
    if (!previewList || selectedSubIds.size === 0) return;
    const updated = {
      ...previewList,
      subscribers: previewList.subscribers.filter(s => !selectedSubIds.has(s.id)),
      subscribersCount: previewList.subscribers.filter(s => !selectedSubIds.has(s.id)).length,
    };
    updated.ispBreakdown = calcIspBreakdown(updated.subscribers);
    saveList(updated);
    setPreviewList(updated);
    setSelectedSubIds(new Set());
    showToast(`Deleted ${selectedSubIds.size} contacts`, 'info');
  };

  const deleteAllSubs = () => {
    if (!previewList) return;
    const updated = { ...previewList, subscribers: [], subscribersCount: 0, ispBreakdown: { gmail: 0, outlook: 0, yahoo: 0, other: 0 } };
    saveList(updated);
    setPreviewList(updated);
    setSelectedSubIds(new Set());
    showToast('All contacts removed', 'info');
  };

  const deleteSingleSub = (subId: string) => {
    if (!previewList) return;
    const updated = {
      ...previewList,
      subscribers: previewList.subscribers.filter(s => s.id !== subId),
    };
    updated.subscribersCount = updated.subscribers.length;
    updated.ispBreakdown = calcIspBreakdown(updated.subscribers);
    saveList(updated);
    setPreviewList(updated);
    showToast('Contact removed', 'info');
  };

  const copySubsToClipboard = () => {
    if (!previewList) return;
    const csv = previewList.subscribers.map(s => `${s.name},${s.email},${s.company || ''}`).join('\n');
    navigator.clipboard.writeText(csv);
    showToast('Contacts copied to clipboard', 'success');
  };

  // ─── Test Email ─────────────────────────────────────────────────────────────
  const handleSendTestEmail = async () => {
    if (!testEmailTo.trim() || !testEmailTo.includes('@')) {
      showToast('Enter a valid email address', 'error');
      return;
    }
    const smtp = smtps.find(s => s.id === testSmtpId);
    if (!smtp) { showToast('Select an SMTP account', 'error'); return; }

    setIsSendingTest(true);
    const res = await sendRealTestEmail(smtp, testEmailTo);
    setIsSendingTest(false);
    if (res.success) {
      showToast(`Test email sent to ${testEmailTo}!`, 'success');
      setTestEmailModal(false);
      setTestEmailTo('');
    } else {
      showToast(`Failed: ${res.message}`, 'error');
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const resetForm = () => { setListName(''); setListDescription(''); setRawText(''); };

  const parseSubscribers = (text: string): Subscriber[] => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    return lines.map((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      const email = parts[1] || parts[0];
      const name = parts.length > 1 ? parts[0] : 'Subscriber ' + (idx + 1);
      const company = parts[2] || '';
      return { id: 'sub-' + Date.now() + '-' + idx, name, email, company, addedAt: new Date().toISOString().substring(0, 10) };
    }).filter(s => s.email.includes('@'));
  };

  const calcIspBreakdown = (subs: Subscriber[]) => {
    let gmail = 0, outlook = 0, yahoo = 0, other = 0;
    subs.forEach(s => {
      const l = s.email.toLowerCase();
      if (l.includes('@gmail.com')) gmail++;
      else if (l.includes('@outlook.') || l.includes('@hotmail.')) outlook++;
      else if (l.includes('@yahoo.')) yahoo++;
      else other++;
    });
    return { gmail, outlook, yahoo, other };
  };

  const totalContacts = lists.reduce((a, l) => a + l.subscribersCount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Mailing Lists Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Upload, paste, edit and manage subscriber lists with full CRUD control</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTestEmailModal(true)} className="glass-btn-secondary text-xs">
            <Mail className="w-4 h-4" /> Test Email
          </button>
          <button onClick={() => setIsCreateModalOpen(true)} className="glass-btn-primary text-xs">
            <Plus className="w-4 h-4" /> Create New List
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-white">{lists.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Lists</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{totalContacts.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Total Contacts</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{smtps.filter(s => s.status === 'active').length}</p>
          <p className="text-xs text-slate-400 mt-1">Active SMTPs</p>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <div key={list.id} className="glass-card p-5 space-y-3 hover:border-purple-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-purple-400 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
                  {list.subscribersCount.toLocaleString()} Contacts
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{list.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{list.description || 'Targeted Subscriber Audience'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-2 border-t border-white/5">
                <span>Gmail: <b className="text-rose-400">{list.ispBreakdown.gmail}</b></span>
                <span>Outlook: <b className="text-blue-400">{list.ispBreakdown.outlook}</b></span>
                <span>Yahoo: <b className="text-purple-400">{list.ispBreakdown.yahoo}</b></span>
                <span>Other: <b className="text-emerald-400">{list.ispBreakdown.other}</b></span>
              </div>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">{list.createdAt}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => { setPreviewList(list); setSelectedSubIds(new Set()); }} className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors" title="View & Manage">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleOpenEdit(list)} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors" title="Edit List">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteConfirmId(list.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete List">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setActiveTab('bulk_sender')} className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-md shadow-purple-600/30">
                  <Send className="w-2.5 h-2.5" /> Send
                </button>
              </div>
            </div>
          </div>
        ))}
        {lists.length === 0 && (
          <div className="col-span-3 glass-card p-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-3">No mailing lists yet</p>
            <button onClick={() => setIsCreateModalOpen(true)} className="glass-btn-primary text-xs">
              <Plus className="w-4 h-4" /> Create Your First List
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CREATE LIST MODAL                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}>
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" /> Create Mailing List</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">List Name *</label>
                  <input value={listName} onChange={e => setListName(e.target.value)} placeholder="e.g. VIP SaaS Founders" className="w-full glass-input text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Description</label>
                  <input value={listDescription} onChange={e => setListDescription(e.target.value)} placeholder="e.g. Qualified outbound leads" className="w-full glass-input text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Paste Subscribers (Name, Email, Company — one per line)
                </label>
                <textarea
                  rows={8} value={rawText} onChange={e => setRawText(e.target.value)}
                  placeholder={"John Doe,john@gmail.com,Acme Corp\nSarah Connor,sarah@cyberdyne.org,Cyberdyne"}
                  className="w-full glass-input font-mono text-xs leading-relaxed resize-none"
                  onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {rawText.split('\n').filter(l => l.includes('@')).length} emails detected — Drag & drop a CSV file here or paste directly
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="glass-btn-secondary text-xs">
                  <Upload className="w-4 h-4" /> Upload CSV
                </button>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="glass-btn-primary text-xs"><Upload className="w-4 h-4" /> Save Mailing List</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* EDIT LIST MODAL                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isEditModalOpen && editingList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}>
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Edit3 className="w-5 h-5 text-cyan-400" /> Edit List: {editingList.name}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">List Name *</label>
                  <input value={listName} onChange={e => setListName(e.target.value)} className="w-full glass-input text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Description</label>
                  <input value={listDescription} onChange={e => setListDescription(e.target.value)} className="w-full glass-input text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Subscribers ({rawText.split('\n').filter(l => l.includes('@')).length} detected)
                </label>
                <textarea
                  rows={10} value={rawText} onChange={e => setRawText(e.target.value)}
                  className="w-full glass-input font-mono text-xs leading-relaxed resize-none"
                  onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                />
                <p className="text-[10px] text-slate-500 mt-1">Add, remove, or edit subscribers directly. Paste or drag CSV file.</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="glass-btn-secondary text-xs">
                  <Upload className="w-4 h-4" /> Upload CSV
                </button>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingList(null); resetForm(); }} className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-400">Cancel</button>
                <button type="submit" className="glass-btn-primary text-xs"><Edit3 className="w-4 h-4" /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* VIEW SUBSCRIBERS MODAL (with select all, delete, edit, copy)          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {previewList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreviewList(null)}>
          <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col m-4" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{previewList.name}</h3>
                <p className="text-[11px] text-slate-400">{previewList.subscribersCount} Total Contacts {selectedSubIds.size > 0 && `— ${selectedSubIds.size} selected`}</p>
              </div>
              <button onClick={() => setPreviewList(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {/* Toolbar */}
            <div className="p-3 border-b border-white/5 flex items-center justify-between gap-3 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <button onClick={toggleSelectAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                  {selectedSubIds.size === previewList.subscribers.length && previewList.subscribers.length > 0
                    ? <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                    : <Square className="w-3.5 h-3.5" />
                  }
                  {selectedSubIds.size === previewList.subscribers.length && previewList.subscribers.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
                {selectedSubIds.size > 0 && (
                  <button onClick={deleteSelectedSubs} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedSubIds.size})
                  </button>
                )}
                <button onClick={deleteAllSubs} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete All
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={copySubsToClipboard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search..." className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white w-40"
                  />
                </div>
              </div>
            </div>

            {/* Subscriber List */}
            <div className="flex-1 overflow-y-auto max-h-[50vh]">
              {previewList.subscribers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No subscribers in this list</div>
              ) : (
                previewList.subscribers
                  .filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()) || (s.company || '').toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors text-xs">
                      <button onClick={() => toggleSubSelection(sub.id)} className="shrink-0">
                        {selectedSubIds.has(sub.id) ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-white">{sub.name}</span>
                        <span className="text-slate-400 ml-2 font-mono">{sub.email}</span>
                      </div>
                      <span className="text-purple-400 text-[11px]">{sub.company}</span>
                      <button onClick={() => deleteSingleSub(sub.id)} className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 flex items-center justify-between bg-slate-900/50">
              <span className="text-[10px] text-slate-500">{previewList.subscribersCount} contacts</span>
              <button onClick={() => setPreviewList(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
          <div className="glass-card w-full max-w-sm p-6 m-4 border-red-500/30" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete List?</h3>
            <p className="text-xs text-slate-400 mb-4">This will permanently remove the list and all its subscribers.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-400">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TEST EMAIL MODAL                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {testEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setTestEmailModal(false)}>
          <div className="glass-card w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Mail className="w-5 h-5 text-cyan-400" /> Test SMTP Server</h3>
              <button onClick={() => setTestEmailModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Send a real test email to verify your SMTP server is working correctly.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">SMTP Account</label>
                <select value={testSmtpId} onChange={e => setTestSmtpId(e.target.value)} className="w-full glass-input text-xs">
                  {smtps.filter(s => s.status === 'active').map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.host}:{s.port}</option>
                  ))}
                  {smtps.filter(s => s.status === 'active').length === 0 && <option disabled>No active SMTP</option>}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Recipient Email</label>
                <input type="email" value={testEmailTo} onChange={e => setTestEmailTo(e.target.value)} placeholder="your@email.com" className="w-full glass-input text-xs" />
              </div>
              <button onClick={handleSendTestEmail} disabled={isSendingTest} className="w-full glass-btn-primary text-xs py-3">
                {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSendingTest ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
