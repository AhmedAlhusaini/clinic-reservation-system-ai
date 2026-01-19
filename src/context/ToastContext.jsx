import React, { createContext, useContext, useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        // Auto remove after 3s
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                zIndex: 9999
            }}>
                {toasts.map(toast => (
                    <div key={toast.id} style={{
                        backgroundColor: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
                        color: toast.type === 'error' ? '#ef4444' : '#16a34a',
                        border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
                        padding: '1rem',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minWidth: '250px',
                        animation: 'fadeIn 0.3s ease-in'
                    }}>
                        <span style={{ fontWeight: '500' }}>{toast.message}</span>
                        <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
