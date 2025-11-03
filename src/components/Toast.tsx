import React from 'react';

type Toast = { id: number; message: string; type?: 'info' | 'success' | 'error' };

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message: string; type?: Toast['type'] };
      if (!detail || !detail.message) return;
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((t) => [...t, { id, message: detail.message, type: detail.type }]);
      setTimeout(() => {
        setToasts((t) => t.filter(x => x.id !== id));
      }, 4000);
    };
    window.addEventListener('app-toast', handler as EventListener);
    return () => window.removeEventListener('app-toast', handler as EventListener);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded shadow-md text-sm ${t.type === 'error' ? 'bg-red-50 text-red-700' : t.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-white text-gray-900'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
