import React, { useState, useEffect } from 'react';

import '../App.jsx'; // Ensure it uses the CSS we will write below

const ToastContainer = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    // This exposes the function globally to the window object
    window.showAppToast = (message, type = 'info') => {
      setToast({ show: true, message, type });
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
    };
  }, []);

  if (!toast.show) return null;

  return (
    <div className={`app-toast toast-${toast.type}`}>
      {/* Icon based on type */}
      <span className="toast-icon">
        {toast.type === 'success' && '✅'}
        {toast.type === 'error' && '❌'}
        {toast.type === 'info' && 'ℹ️'}
      </span>
      <span className="toast-message">{toast.message}</span>
    </div>
  );
};

export default ToastContainer;