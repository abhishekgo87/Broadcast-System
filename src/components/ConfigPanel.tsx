import type { TwilioConfig } from '../types';

interface ConfigPanelProps {
  config: TwilioConfig;
  onChange: (config: TwilioConfig) => void;
  onSave: () => void;
  onClear: () => void;
}

export default function ConfigPanel({ config, onChange, onSave, onClear }: ConfigPanelProps) {
  return (
    <section className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-2xl p-7 hover:border-gray-700/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-700/15 flex items-center justify-center text-lg">🔑</div>
          <h2 className="text-lg font-semibold text-gray-100">Twilio Configuration</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account SID</label>
          <input
            type="text"
            value={config.accountSid}
            onChange={(e) => onChange({ ...config, accountSid: e.target.value })}
            placeholder="ACxxxxxxxxxxxxxxxx"
            className="px-4 py-3 bg-gray-950/80 border border-gray-700/20 rounded-lg text-gray-200 text-sm outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-700/10 transition-all placeholder-gray-600"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Auth Token</label>
          <input
            type="password"
            value={config.authToken}
            onChange={(e) => onChange({ ...config, authToken: e.target.value })}
            placeholder="Your auth token"
            className="px-4 py-3 bg-gray-950/80 border border-gray-700/20 rounded-lg text-gray-200 text-sm outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-700/10 transition-all placeholder-gray-600"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From Number</label>
          <input
            type="text"
            value={config.fromNumber}
            onChange={(e) => onChange({ ...config, fromNumber: e.target.value })}
            placeholder="+1XXXXXXXXXX"
            className="px-4 py-3 bg-gray-950/80 border border-gray-700/20 rounded-lg text-gray-200 text-sm outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-700/10 transition-all placeholder-gray-600"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={onSave}
          className="px-5 py-2.5 bg-gray-700/10 border border-gray-700/20 rounded-lg text-indigo-400 text-sm font-semibold hover:bg-gray-700/15 hover:border-gray-700/30 transition-all cursor-pointer flex items-center gap-2"
        >
          💾 Save Config
        </button>
        <button
          onClick={onClear}
          className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-semibold hover:bg-red-500/15 transition-all cursor-pointer flex items-center gap-2"
        >
          🗑️ Clear
        </button>
      </div>
    </section>
  );
}
