import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, ShieldCheck, Activity, Loader2 } from 'lucide-react';

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
      background: '#f8fafc', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          width: '100%', maxWidth: '420px', padding: '1rem', zIndex: 10
        }}
      >
        <div className="premium-card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          {/* Top Line Decor */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              width: 64, height: 64, background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', color: '#fff', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
              transform: 'rotate(-3deg)'
            }}>
              <ShieldCheck size={32} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              PI Payment Tracker
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
              Secure access to your FMS dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }}>
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem',
                  fontSize: '0.95rem', fontWeight: 600, outline: 'none', transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem',
                  fontSize: '0.95rem', fontWeight: 600, outline: 'none', transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
            <Activity size={14} /> System Status: Online
          </div>
        </div>
      </motion.div>
    </div>
  );
};
