import { useApp } from '../../context/AppContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div id="toast-container" className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClasses = 'bg-white/95 border-gray-100 text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.04)]';
        
        if (toast.type === 'success') {
          Icon = CheckCircle;
          colorClasses = 'bg-emerald-50/95 border-emerald-100 text-emerald-900 shadow-[0_10px_30px_rgba(16,185,129,0.06)]';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClasses = 'bg-rose-50/95 border-rose-100 text-rose-900 shadow-[0_10px_30px_rgba(244,63,94,0.06)]';
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 hover:scale-[1.02] ${colorClasses}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-grow text-sm font-medium pr-2 leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 rounded-lg p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
