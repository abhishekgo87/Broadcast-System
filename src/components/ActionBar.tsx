interface ActionBarProps {
  selectedCount: number;
  batchSize: number;
  onBatchSizeChange: (size: number) => void;
  onSend: () => void;
  onReset: () => void;
  isSending: boolean;
  disabled: boolean;
}

export default function ActionBar({
  selectedCount,
  batchSize,
  onBatchSizeChange,
  onSend,
  onReset,
  isSending,
  disabled,
}: ActionBarProps) {
  return (
    <section className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-2xl p-7 hover:border-gray-700/30 transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400 font-medium">Batch Size:</label>
            <select
              value={batchSize}
              onChange={(e) => onBatchSizeChange(Number(e.target.value))}
              className="px-4 py-2.5 bg-gray-950/80 border border-gray-700/20 rounded-lg text-gray-200 text-sm outline-none focus:border-gray-700 cursor-pointer"
            >
              <option value={1}>1 at a time</option>
              <option value={10}>10 at a time</option>
              <option value={50}>50 at a time</option>
              <option value={100}>100 at a time</option>
              <option value={500}>500 at a time</option>
              <option value={1000}>1000 at a time</option>
            </select>
          </div>
        </div>
        <button
          onClick={onSend}
          disabled={disabled || isSending}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-gray-700/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-700/40 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer flex items-center gap-2 text-sm"
        >
          {isSending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>📤 Send to {selectedCount} Selected</>
          )}
        </button>
        <button
          onClick={onReset}
          disabled={isSending}
          className="px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 text-sm ml-auto sm:ml-0"
        >
          🔄 Clear Form
        </button>
      </div>
    </section>
  );
}
