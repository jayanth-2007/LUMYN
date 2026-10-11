import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast || !toast.show) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#FB7185] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#22D3EE] shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-[#FBBF24] shrink-0" />,
  };

  const borders = {
    success: 'border-[#34D399]/30 bg-[#11111B]/98 shadow-[0_0_24px_-4px_rgba(52,211,153,0.2)]',
    error: 'border-[#FB7185]/30 bg-[#11111B]/98 shadow-[0_0_24px_-4px_rgba(251,113,133,0.2)]',
    info: 'border-[#22D3EE]/30 bg-[#11111B]/98 shadow-[0_0_24px_-4px_rgba(34,211,238,0.2)]',
    warning: 'border-[#FBBF24]/30 bg-[#11111B]/98 shadow-[0_0_24px_-4px_rgba(251,191,36,0.2)]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slide-up">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${borders[toast.type] || borders.info}`}
      >
        {icons[toast.type] || icons.info}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#F4F4F8] leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-1 text-[#717187] hover:text-[#F4F4F8] transition-colors p-1 rounded-lg hover:bg-[#232334]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
