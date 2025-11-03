
import React, { useEffect } from 'react';

interface ToastProps {
  toast: { message: string; type: 'success' | 'error'; duration?: number } | null;
  setToast: (toast: { message: string; type: 'success' | 'error'; duration?: number } | null) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, setToast }) => {
  useEffect(() => {
    if (toast?.duration) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  return (
    toast && (
      <div
        className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}
      >
        {toast.message}
      </div>
    )
  );
};

export default Toast;
