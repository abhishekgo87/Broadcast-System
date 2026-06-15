import { useState, useEffect } from 'react';
import type { Campaign } from '../types';

interface CampaignHistoryProps {
  API_BASE: string;
}

export default function CampaignHistory({ API_BASE }: CampaignHistoryProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch(`${API_BASE}/api/campaigns`);
        const data = await res.json();
        if (data.success) {
          setCampaigns(data.campaigns);
        } else {
          setError('Failed to load campaigns.');
        }
      } catch (err) {
        setError('Error fetching campaigns.');
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">
        <span className="animate-spin text-2xl mr-3">⏳</span> Loading Campaigns...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
        {error}
      </div>
    );
  }

  return (
    <section className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-gray-700/30">
        <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <span className="text-blue-500">📊</span> Campaign History
        </h2>
        <p className="text-sm text-gray-500 mt-1">View the performance of your past SMS campaigns.</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <span className="text-4xl block mb-3">📭</span>
          No campaigns found. Start your first campaign!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700/30 text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Campaign Name</th>
                <th className="p-4 font-semibold text-center">Total</th>
                <th className="p-4 font-semibold text-center text-green-400">Sent</th>
                <th className="p-4 font-semibold text-center text-red-400">Failed</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/20">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                    {new Date(camp.date).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-200">{camp.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[250px] mt-1" title={camp.message}>
                      {camp.message}
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium text-gray-300">{camp.totalContacts}</td>
                  <td className="p-4 text-center font-medium text-green-400">{camp.sent}</td>
                  <td className="p-4 text-center font-medium text-red-400">{camp.failed}</td>
                  <td className="p-4 text-right">
                    {camp.status === 'completed' && (
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold">
                        Completed
                      </span>
                    )}
                    {camp.status === 'partially_failed' && (
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-semibold">
                        Partial
                      </span>
                    )}
                    {camp.status === 'failed' && (
                      <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-semibold">
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
