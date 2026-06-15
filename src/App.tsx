import { useState, useCallback } from 'react';
import ConfigPanel from './components/ConfigPanel';
import UploadZone from './components/UploadZone';
import ContactsTable from './components/ContactsTable';
import MessageComposer from './components/MessageComposer';
import ActionBar from './components/ActionBar';
import StatusDashboard from './components/StatusDashboard';
import ToastContainer from './components/ToastContainer';
import SingleSmsPanel from './components/SingleSmsPanel';
import CampaignHistory from './components/CampaignHistory';
import { useToast } from './hooks/useToast';
import type { Contact, TwilioConfig, UploadResponse, SendResponse } from './types';

const API_BASE = 'http://localhost:3001';

export default function App() {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  // Config state
  const [config, setConfig] = useState<TwilioConfig>(() => {
    const saved = localStorage.getItem('twilio_config');
    if (saved) return JSON.parse(saved);
    return { accountSid: '', authToken: '', fromNumber: '+19067718677' };
  });

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileInfo, setFileInfo] = useState('');
  const [campaignName, setCampaignName] = useState('');

  // Message state
  const [message, setMessage] = useState('');
  const [batchSize, setBatchSize] = useState(10);

  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });

  // Toast
  const { toasts, showToast } = useToast();

  // ==================== CONFIG HANDLERS ====================
  const saveConfig = useCallback(() => {
    localStorage.setItem('twilio_config', JSON.stringify(config));
    showToast('✅ Config saved successfully!', 'success');
  }, [config, showToast]);

  const clearConfig = useCallback(() => {
    localStorage.removeItem('twilio_config');
    setConfig({ accountSid: '', authToken: '', fromNumber: '' });
    showToast('🗑️ Config cleared!', 'info');
  }, [showToast]);

  // ==================== FILE UPLOAD ====================
  const handleFileUpload = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
      showToast('❌ Only Excel (.xlsx, .xls) or CSV files are allowed!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    showToast('📤 Uploading file...', 'info');

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await res.json();

      if (!res.ok) {
        showToast('❌ ' + ((data as unknown as { error: string }).error || 'Upload failed!'), 'error');
        return;
      }

      const contactsWithStatus = data.contacts.map(c => ({ ...c, status: 'waiting' as const }));
      setContacts(contactsWithStatus);
      setSelectedIds(new Set());
      setFileName(file.name);
      setFileInfo(`${file.name} — ${data.validContacts} contacts loaded (${data.totalRows} rows, Phone: ${data.phoneColumn}, Name: ${data.nameColumn})`);
      showToast(`✅ ${data.validContacts} contacts loaded!`, 'success');

    } catch (err) {
      showToast('❌ Upload error: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    }
  }, [showToast]);

  const clearFile = useCallback(() => {
    setContacts([]);
    setSelectedIds(new Set());
    setFileName('');
    setFileInfo('');
    setShowStatus(false);
    showToast('📁 File removed', 'info');
  }, [showToast]);

  // ==================== SELECTION ====================
  const toggleContact = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    const filtered = searchQuery.trim()
      ? contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : contacts;

    setSelectedIds(prev => {
      const allSelected = filtered.every(c => prev.has(c.id));
      const next = new Set(prev);
      if (allSelected) {
        filtered.forEach(c => next.delete(c.id));
      } else {
        filtered.forEach(c => next.add(c.id));
      }
      return next;
    });
  }, [contacts, searchQuery]);

  const invertSelection = useCallback(() => {
    const filtered = searchQuery.trim()
      ? contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : contacts;

    setSelectedIds(prev => {
      const next = new Set(prev);
      filtered.forEach(c => {
        if (next.has(c.id)) next.delete(c.id);
        else next.add(c.id);
      });
      return next;
    });
  }, [contacts, searchQuery]);

  // Computed selection state
  const filtered = searchQuery.trim()
    ? contacts.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : contacts;
  const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id));
  const someSelected = filtered.some(c => selectedIds.has(c.id));

  // ==================== SEND SMS ====================
  const sendSMS = useCallback(async () => {
    if (isSending) return;

    if (!config.accountSid || !config.authToken || !config.fromNumber) {
      showToast('❌ Please provide credentials in the Twilio config first!', 'error');
      return;
    }
    if (selectedIds.size === 0) {
      showToast('❌ No contact selected!', 'error');
      return;
    }
    if (!message.trim()) {
      showToast('❌ Message content is required!', 'error');
      return;
    }

    setIsSending(true);
    setShowStatus(true);

    const selectedContacts = contacts.filter(c => selectedIds.has(c.id));
    setStats({ total: selectedContacts.length, sent: 0, failed: 0, pending: selectedContacts.length });

    // Mark selected as pending
    setContacts(prev => prev.map(c =>
      selectedIds.has(c.id) ? { ...c, status: 'pending' as const } : c
    ));

    try {
      const res = await fetch(`${API_BASE}/api/send-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: selectedContacts,
          message,
          accountSid: config.accountSid,
          authToken: config.authToken,
          fromNumber: config.fromNumber,
          batchSize,
          campaignName,
        }),
      });

      const data: SendResponse = await res.json();

      if (!res.ok) {
        showToast('❌ ' + ((data as unknown as { error: string }).error || 'Send failed!'), 'error');
        setIsSending(false);
        return;
      }

      // Update contact statuses
      setContacts(prev => prev.map(c => {
        const result = data.results.find(r => r.id === c.id);
        if (result) {
          return { ...c, status: result.status, error: result.error };
        }
        return c;
      }));

      setStats({
        total: data.total,
        sent: data.sent,
        failed: data.failed,
        pending: 0,
      });

      if (data.failed === 0) {
        showToast(`🎉 ${data.sent} SMS successfully sent!`, 'success');
        setTimeout(() => {
          setCampaignName('');
          setMessage('');
          clearFile();
        }, 3000);
      } else {
        showToast(`⚠️ ${data.sent} sent, ${data.failed} failed`, 'error');
      }

    } catch (err) {
      showToast('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setIsSending(false);
    }
  }, [isSending, config, selectedIds, message, contacts, batchSize, showToast]);

  const canSend = selectedIds.size > 0 && message.trim() !== '' && !isSending;

  // ==================== RENDER ====================
  return (
    <div className="bg-gray-950 text-gray-200 min-h-screen overflow-x-hidden">
      {/* Background blobs */}



      {/* Header */}
      <header className="relative px-6 md:px-10 py-6 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/20 flex items-center justify-between z-10">
        <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-600 opacity-60" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-gray-700/30">
            🚀
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-blue-600 bg-clip-text text-transparent">
              Twilio Bulk SMS Sender
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Excel Import → Select → Send Bulk SMS</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-600/10 border border-green-600/30 rounded-full text-sm text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {isSending ? 'Sending...' : showStatus && stats.sent > 0 ? `${stats.sent} Sent ✓` : 'Ready'}
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 relative z-[1]">
        <div className="flex space-x-1 p-1 bg-gray-900/50 rounded-xl border border-gray-700/30 w-fit">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'new' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
            ➕ New Campaign
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
            📊 Campaign History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 relative z-[1] space-y-6">
        <ConfigPanel
          config={config}
          onChange={setConfig}
          onSave={saveConfig}
          onClear={clearConfig}
        />

        {activeTab === 'history' ? (
          <CampaignHistory API_BASE={API_BASE} />
        ) : (
          <>
            <SingleSmsPanel
              config={config}
              showToast={showToast}
              API_BASE={API_BASE}
            />

            <UploadZone
              onFileUpload={handleFileUpload}
              fileName={fileName}
              fileInfo={fileInfo}
              onClear={clearFile}
              campaignName={campaignName}
              onCampaignNameChange={setCampaignName}
            />

            {contacts.length > 0 && (
              <>
                <ContactsTable
                  contacts={contacts}
                  selectedIds={selectedIds}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onToggleContact={toggleContact}
                  onToggleAll={toggleAll}
                  onInvertSelection={invertSelection}
                  allSelected={allSelected}
                  someSelected={someSelected}
                />

                <MessageComposer
                  message={message}
                  onChange={setMessage}
                />

                <ActionBar
                  selectedCount={selectedIds.size}
                  batchSize={batchSize}
                  onBatchSizeChange={setBatchSize}
                  onSend={sendSMS}
                  onReset={() => {
                    setCampaignName('');
                    setMessage('');
                    clearFile();
                  }}
                  isSending={isSending}
                  disabled={!canSend}
                />
              </>
            )}
          </>
        )}

        {showStatus && activeTab === 'new' && (
          <StatusDashboard
            total={stats.total}
            sent={stats.sent}
            failed={stats.failed}
            pending={stats.pending}
          />
        )}
      </main>

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
