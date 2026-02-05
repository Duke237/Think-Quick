import { useState, useEffect } from 'react';

const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const types = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-bg-primary',
    info: 'bg-cyan-primary text-bg-primary',
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${positions[position]} z-50 animate-slide-in`}>
      <div className={`${types[type]} px-6 py-4 rounded-xl shadow-deep flex items-center gap-3 min-w-[300px]`}>
        <span className="flex-1">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="text-xl font-bold hover:opacity-75 transition-opacity"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// Toast Container for managing multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div key={toast.id} className="pointer-events-auto" style={{ top: `${index * 80}px` }}>
          <Toast
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;