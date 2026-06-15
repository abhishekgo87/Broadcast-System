interface MessageComposerProps {
  message: string;
  onChange: (message: string) => void;
}

export default function MessageComposer({ message, onChange }: MessageComposerProps) {
  const len = message.length;
  const counterColor = len > 160 ? 'text-red-400' : len > 140 ? 'text-amber-400' : 'text-gray-500';

  return (
    <section className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-2xl p-7 hover:border-gray-700/30 transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center text-lg">✉️</div>
        <h2 className="text-lg font-semibold text-gray-100">Compose Message</h2>
      </div>
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Type your message here..."
          className="w-full px-4 py-4 bg-gray-950/80 border border-gray-700/20 rounded-xl text-gray-200 text-sm outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-700/10 transition-all placeholder-gray-600 resize-y leading-relaxed"
        />
        <span className={`absolute bottom-4 right-4 text-xs font-medium ${counterColor}`}>
          {len} / 160
        </span>
      </div>
    </section>
  );
}
