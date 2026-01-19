import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Stethoscope } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Strict Validation: Username and Password Required
    if (!username.trim() || !password.trim()) {
        setError('Please enter both username and password.');
        return;
    }

    const success = login(role, password, username);
    if (!success) {
      setError('Invalid credentials.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-body)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            borderRadius: '50%', 
            marginBottom: '1rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '4px solid white'
          }}>
            {/* Using Public folder image or fallback */}
            <img 
              src="/doctor-avatar.png" 
              alt="Doctor" 
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.style.display = 'none'; // Hide if fails
                e.target.nextSibling.style.display = 'flex'; // Show fallback
              }}
            />
             <div style={{ 
                width: '100px', height: '100px', 
                backgroundColor: 'var(--primary-light)', 
                color: 'var(--primary)',
                display: 'none', // Hidden by default if img loads
                alignItems: 'center', justifyContent: 'center' 
             }}>
                <Stethoscope size={48} />
             </div>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Clinic Login</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to manage reservations</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: 'var(--radius)', 
                border: '1px solid var(--border)',
                outline: 'none'
              }}
            >
                <option value="admin">Admin (Doctor)</option>
                <option value="assistant">Assistant</option>
                <option value="owner">Super Admin (Owner)</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                outline: 'none'
              }}
              placeholder="Enter your username"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                outline: 'none'
              }}
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
