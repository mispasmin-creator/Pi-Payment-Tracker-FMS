import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

interface Props {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');
    const success = await onLogin(username, password);
    if (!success) {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8fafc', fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}
      >
        <div style={{
          background: '#ffffff',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 52, height: 52, background: '#3b82f6',
              borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', color: '#fff',
              boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)'
            }}>
              <ShieldCheck size={28} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              Login
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>

            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Username Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginLeft: '0.2rem' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
                    fontSize: '0.9rem', fontWeight: 600, outline: 'none', transition: 'all 0.2s',
                    boxSizing: 'border-box', color: '#1e293b'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.06)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginLeft: '0.2rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
                    fontSize: '0.9rem', fontWeight: 600, outline: 'none', transition: 'all 0.2s',
                    boxSizing: 'border-box', color: '#1e293b'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.06)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', marginTop: '0.5rem' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.85rem', background: '#3b82f6', color: '#fff',
                border: 'none', borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.05)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Validating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>

            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
