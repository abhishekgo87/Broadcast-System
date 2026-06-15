import { useRef, useState, type DragEvent } from 'react';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  fileName?: string;
  fileInfo?: string;
  onClear: () => void;
  campaignName?: string;
  onCampaignNameChange?: (name: string) => void;
}

function downloadTemplate() {
  const link = document.createElement('a');
  link.href = '/sms_contacts_template.xlsx';
  link.setAttribute('download', 'sms_contacts_template.xlsx');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function UploadZone({ onFileUpload, fileName, fileInfo, onClear, campaignName, onCampaignNameChange }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <section className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-2xl p-7 hover:border-gray-700/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-lg">📁</div>
          <h2 className="text-lg font-semibold text-gray-100">Upload Contacts</h2>
        </div>
        <div className="flex items-center gap-3">
          {onCampaignNameChange && (
            <input
              type="text"
              value={campaignName || ''}
              onChange={(e) => onCampaignNameChange(e.target.value)}
              placeholder="Campaign Name"
              className="px-4 py-2 bg-gray-900 border border-gray-700/50 rounded-lg text-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-gray-500 w-48"
            />
          )}
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-green-600/10 border border-green-600/25 rounded-lg text-emerald-400 text-sm font-semibold hover:bg-green-600/20 hover:border-green-600/40 transition-all cursor-pointer flex items-center gap-2"
          >
            📥 Download Template
          </button>
        </div>
      </div>

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl py-12 px-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-0.5
          ${isDragging
            ? 'border-gray-700 bg-gray-700/5 shadow-[0_0_40px_rgba(99,102,241,0.15)]'
            : 'border-gray-700/20 hover:border-gray-700/40'
          }`}
      >
        <span className="text-5xl block mb-4">📤</span>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Drag & Drop or Click Here</h3>
        <p className="text-sm text-gray-500 mb-4">Upload an Excel or CSV file</p>
        <div className="flex gap-2 justify-center">
          {['.xlsx', '.xls', '.csv'].map(ext => (
            <span key={ext} className="px-3 py-1 bg-gray-700/10 border border-gray-700/20 rounded-full text-xs font-semibold text-indigo-400 uppercase">
              {ext}
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {fileName && (
        <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-green-600/10 border border-green-600/20 rounded-lg text-sm text-emerald-400">
          <span>✅</span>
          <span>{fileInfo || fileName}</span>
          <button
            onClick={onClear}
            className="ml-auto text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
          >
            ✕ Remove
          </button>
        </div>
      )}
    </section>
  );
}
