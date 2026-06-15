import { useState, useEffect } from 'react';
import type { MessageTemplate } from '../types';

interface MessageComposerProps {
  message: string;
  onChange: (message: string) => void;
  API_BASE: string;
}

export default function MessageComposer({ message, onChange, API_BASE }: MessageComposerProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [API_BASE]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/templates`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = templates.find(t => t.id === id);
    if (tmpl) {
      onChange(tmpl.content);
    }
  };

  const handleSaveTemplate = async () => {
    if (!message.trim()) return alert('Message content cannot be empty.');
    const name = prompt('Enter a name for this template:');
    if (!name?.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), content: message.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates([...templates, data.template]);
        setSelectedTemplateId(data.template.id);
      } else {
        alert('Failed to save template.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving template.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTemplates(templates.filter(t => t.id !== id));
        if (selectedTemplateId === id) setSelectedTemplateId('');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting template.');
    }
  };

  const len = message.length;
  const counterColor = len > 160 ? 'text-red-400' : len > 140 ? 'text-amber-400' : 'text-gray-500';

  return (
    <section className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-2xl p-7 hover:border-gray-700/30 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center text-lg">✉️</div>
          <h2 className="text-lg font-semibold text-gray-100">Compose Message</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="px-3 py-2 bg-gray-950/80 border border-gray-700/50 rounded-lg text-gray-300 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all cursor-pointer w-48"
          >
            <option value="">-- Load a Template --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {selectedTemplateId && (
            <button
              onClick={() => handleDeleteTemplate(selectedTemplateId)}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
              title="Delete Selected Template"
            >
              🗑️
            </button>
          )}
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving || !message.trim()}
            className="px-4 py-2 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-400 text-sm font-semibold hover:bg-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '⏳ Saving...' : '💾 Save as Template'}
          </button>
        </div>
      </div>
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedTemplateId(''); // clear selection if they edit
          }}
          rows={4}
          placeholder="Type your message here..."
          className="w-full px-4 py-4 bg-gray-950/80 border border-gray-700/20 rounded-xl text-gray-200 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all placeholder-gray-600 resize-y leading-relaxed"
        />
        <span className={`absolute bottom-4 right-4 text-xs font-medium ${counterColor}`}>
          {len} / 160
        </span>
      </div>
    </section>
  );
}
