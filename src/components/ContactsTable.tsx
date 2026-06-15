import { useMemo } from 'react';
import type { Contact } from '../types';

interface ContactsTableProps {
  contacts: Contact[];
  selectedIds: Set<number>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleContact: (id: number) => void;
  onToggleAll: () => void;
  onInvertSelection: () => void;
  allSelected: boolean;
  someSelected: boolean;
}

export default function ContactsTable({
  contacts,
  selectedIds,
  searchQuery,
  onSearchChange,
  onToggleContact,
  onToggleAll,
  onInvertSelection,
  allSelected,
  someSelected,
}: ContactsTableProps) {

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-green-600/10 text-emerald-400 border border-green-600/20">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />Sent ✓
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />Failed ✕
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />Sending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gray-500/10 text-gray-500 border border-gray-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />Waiting
          </span>
        );
    }
  };

  return (
    <section className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-2xl p-7 hover:border-gray-700/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-600/15 flex items-center justify-center text-lg">👥</div>
          <h2 className="text-lg font-semibold text-gray-100">Contacts</h2>
        </div>
        <div className="text-sm text-gray-400 px-3 py-1.5 bg-gray-700/8 rounded-lg font-medium">
          <span className="text-indigo-400 font-bold">{selectedIds.size}</span> / {contacts.length} selected
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
              onChange={onToggleAll}
              className="w-5 h-5 rounded border-2 border-gray-700/30 bg-gray-950/80 text-gray-700 focus:ring-gray-700/20 focus:ring-offset-0 cursor-pointer accent-gray-700"
            />
            Select All
          </label>
          <button
            onClick={onInvertSelection}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer px-3 py-1.5 bg-gray-700/10 rounded-md border border-gray-700/20"
          >
            ↕️ Invert
          </button>
        </div>
        <div className="relative w-full sm:w-auto">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contacts..."
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-950/80 border border-gray-700/20 rounded-lg text-gray-200 text-sm outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-700/10 transition-all placeholder-gray-600"
          />
        </div>
      </div>

      {/* Table */}
      {filteredContacts.length > 0 ? (
        <div className="rounded-xl overflow-hidden border border-gray-700/15 max-h-96 overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-[5]">
              <tr className="bg-gray-900">
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-700/15 w-12">✓</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-700/15 w-12">#</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-700/15">Name</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-700/15">Phone</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-700/15">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/5">
              {filteredContacts.map((contact) => {
                const isSelected = selectedIds.has(contact.id);
                return (
                  <tr
                    key={contact.id}
                    className={`transition-all duration-200 hover:bg-gray-700/5 cursor-pointer ${isSelected ? 'bg-gray-700/8' : ''}`}
                    onClick={() => onToggleContact(contact.id)}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleContact(contact.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-2 border-gray-700/30 bg-gray-950/80 text-gray-700 focus:ring-gray-700/20 focus:ring-offset-0 cursor-pointer accent-gray-700"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-medium">{contact.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-200 font-medium">{contact.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-cyan-400">{contact.phone}</td>
                    <td className="px-4 py-3">{getStatusBadge(contact.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <span className="text-5xl block mb-4 opacity-50">📋</span>
          <h3 className="text-gray-300 font-semibold mb-1">No contacts to display</h3>
          <p className="text-sm">No matches found, or please upload a file first</p>
        </div>
      )}
    </section>
  );
}
