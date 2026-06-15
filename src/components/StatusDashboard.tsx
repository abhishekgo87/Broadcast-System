interface StatusDashboardProps {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export default function StatusDashboard({ total, sent, failed, pending }: StatusDashboardProps) {
  const completed = sent + failed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-2xl p-7">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center text-lg">📊</div>
        <h2 className="text-lg font-semibold text-gray-100">Sending Status</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="p-5 bg-gray-950/60 border border-gray-700/15 rounded-xl text-center hover:border-gray-700/30 hover:-translate-y-0.5 transition-all duration-300">
          <div className="text-3xl font-extrabold text-indigo-400">{total}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Total</div>
        </div>
        <div className="p-5 bg-gray-950/60 border border-green-600/15 rounded-xl text-center hover:border-green-600/30 hover:-translate-y-0.5 transition-all duration-300">
          <div className="text-3xl font-extrabold text-emerald-400">{sent}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Sent</div>
        </div>
        <div className="p-5 bg-gray-950/60 border border-red-500/15 rounded-xl text-center hover:border-red-500/30 hover:-translate-y-0.5 transition-all duration-300">
          <div className="text-3xl font-extrabold text-red-400">{failed}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Failed</div>
        </div>
        <div className="p-5 bg-gray-950/60 border border-amber-500/15 rounded-xl text-center hover:border-amber-500/30 hover:-translate-y-0.5 transition-all duration-300">
          <div className="text-3xl font-extrabold text-amber-400">{pending}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Pending</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full h-2 bg-gray-950/80 rounded-full overflow-hidden border border-gray-700/15">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500 relative overflow-hidden"
            style={{ width: `${percent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{percent}% complete</span>
          <span>{completed} / {total}</span>
        </div>
      </div>
    </section>
  );
}
