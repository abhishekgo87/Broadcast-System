import { useState } from 'react';
import type { TwilioConfig, SendResponse } from '../types';

interface SingleSmsPanelProps {
  config: TwilioConfig;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  API_BASE: string;
}

export default function SingleSmsPanel({ config, showToast, API_BASE }: SingleSmsPanelProps) {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!config.accountSid || !config.authToken || !config.fromNumber) {
      showToast('❌ Please provide credentials in the Twilio config first!', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('❌ Phone number is required!', 'error');
      return;
    }
    if (!message.trim()) {
      showToast('❌ Message content is required!', 'error');
      return;
    }

    setIsSending(true);

    let formattedPhone = phone.trim().replace(/[\s\-\(\)\.]/g, '');
    if (formattedPhone.startsWith('0') && formattedPhone.length >= 10) {
      formattedPhone = '+91' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+') && formattedPhone.length === 10 && /^\d+$/.test(formattedPhone)) {
      formattedPhone = '+91' + formattedPhone;
    } else if (!formattedPhone.startsWith('+') && formattedPhone.length > 10) {
      formattedPhone = '+' + formattedPhone;
    }

    try {
      const res = await fetch(`${API_BASE}/api/send-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: [{ id: 1, name: 'Single User', phone: formattedPhone }],
          message: message.trim(),
          accountSid: config.accountSid,
          authToken: config.authToken,
          fromNumber: config.fromNumber,
          batchSize: 1,
        }),
      });

      const data: SendResponse = await res.json();

      if (!res.ok) {
        showToast('❌ ' + ((data as unknown as { error: string }).error || 'Send failed!'), 'error');
        setIsSending(false);
        return;
      }

      if (data.failed === 0) {
        showToast(`🎉 SMS successfully sent to ${phone}!`, 'success');
        setPhone('');
        setMessage('');
      } else {
        showToast(`❌ SMS failed: ${data.results[0]?.error || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      showToast('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-2xl p-7 hover:border-gray-700/30 transition-all duration-300 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-lg">📱</div>
        <h2 className="text-lg font-semibold text-gray-100">Quick Single SMS</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recipient Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              className="px-4 py-3 bg-gray-950/80 border border-gray-700/20 rounded-lg text-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-gray-600"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isSending || !phone.trim() || !message.trim()}
            className="mt-auto px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 text-sm"
          >
            {isSending ? (
               <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : '📤'}
            {isSending ? 'Sending...' : 'Send Single SMS'}
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message</label>
          <div className="relative h-full">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-full min-h-[120px] px-4 py-3 bg-gray-950/80 border border-gray-700/20 rounded-lg text-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-gray-600 resize-none leading-relaxed"
            />
            <span className={`absolute bottom-3 right-3 text-xs font-medium ${message.length > 160 ? 'text-red-400' : 'text-gray-500'}`}>
              {message.length} / 160
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
