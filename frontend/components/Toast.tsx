'use client';

import React, { createContext, useContext, useState } from 'react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Render Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              t.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
                : t.type === 'error'
                ? 'border-red-500/30 bg-red-950/90 text-red-200'
                : 'border-purple-500/30 bg-purple-950/90 text-purple-200'
            }`}
          >
            <span className="text-xl shrink-0">
              {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <div>
              <p className="font-bold text-xs">{t.title}</p>
              {t.description && <p className="text-[11px] opacity-80 mt-0.5">{t.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
