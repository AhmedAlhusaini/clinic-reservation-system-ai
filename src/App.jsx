import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReservationProvider } from './context/ReservationContext';
import { ToastProvider } from './context/ToastContext';
import { ConfigProvider, useConfig } from './context/ConfigContext'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminSettings from './pages/AdminSettings';
import { LogOut } from 'lucide-react';

const MainApp = () => {
  const { user, logout } = useAuth();
  const { clinicName, subTitle, logo } = useConfig();
  const [view, setView] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  // Dashboard / Authenticated Layout
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'var(--bg-surface)', 
        borderBottom: '1px solid var(--border)', 
        padding: '0.75rem 1rem' 
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             {logo && (
                 <img 
                    src={logo} 
                    alt="Logo" 
                    style={{ height: '48px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }} 
                    onClick={() => setView('dashboard')}
                 />
             )}
             <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setView('dashboard')}>
                 <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', lineHeight: 1.1 }}>
                    {clinicName}
                 </h1>
                 {subTitle && (
                     <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>{subTitle}</span>
                 )}
             </div>
             {view !== 'dashboard' && (
                 <button onClick={() => setView('dashboard')} className="btn" style={{ fontSize: '0.8rem', marginLeft: '1rem' }}>Back to Dashboard</button>
             )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Welcome, <strong style={{ color: 'var(--text-main)' }}>{user.name}</strong>
            </span>
             <button onClick={() => setView('settings')} className="btn" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
               Settings
             </button>
            <button onClick={logout} className="btn" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
              <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
           {view === 'dashboard' ? <Dashboard /> : <AdminSettings />}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ReservationProvider>
        <ToastProvider>
           <ConfigProvider>
             <MainApp />
           </ConfigProvider>
        </ToastProvider>
      </ReservationProvider>
    </AuthProvider>
  );
}

export default App;
