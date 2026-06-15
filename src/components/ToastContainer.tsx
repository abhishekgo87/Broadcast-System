interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: Toast[];
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-600/90';
      case 'error': return 'bg-red-500/90';
      default: return 'bg-gray-700/90';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-5 py-3.5 rounded-xl text-sm font-medium backdrop-blur-xl shadow-2xl text-white flex items-center gap-2 max-w-sm animate-slide-in ${getColor(toast.type)}`}
          style={{
            animation: 'slideIn 0.3s ease',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
