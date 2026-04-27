// MasterEntryForm.tsx — Premium Earth-Light Theme
import React, { useState } from 'react';
import { UserPlus, Truck, Save, X, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onClose: () => void;
  onSave: (data: { partyName?: string; vendorName?: string }) => void;
}

const E = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#eff6ff',
  success: '#10b981',
  danger: '#ef4444',
  text: 'var(--text-primary)',
  muted: 'var(--text-secondary)',
  border: 'var(--border)',
  bg: 'var(--bg-main)'
};

const B = {
  900: '#0f172a', 800: '#1e293b', 700: '#334155', 600: '#475569',
  500: '#64748b', 400: '#94a3b8', 300: '#cbd5e1', 200: '#e2e8f0',
  100: '#f1f5f9', 50: '#f8fafc',
};

export const MasterEntryForm: React.FC<Props> = ({ onClose, onSave }) => {
  const [type, setType] = useState<'client' | 'vendor'>('client');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const payload = type === 'client' ? { partyName: name } : { vendorName: name };
    await onSave(payload);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.1)', backdropFilter: 'blur(12px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="premium-card"
        style={{ width: '100%', maxWidth: 440, overflow: 'hidden', padding: 0 }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', background: B[50], borderBottom: `1px solid ${B[100]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: B[900], fontFamily: 'Outfit, sans-serif' }}>Add New Master</h3>
            <p style={{ fontSize: '0.8rem', color: B[500], fontWeight: 600 }}>Update your partner directory</p>
          </div>
          <button onClick={onClose} style={{ 
            width: 36, height: 36, borderRadius: '1rem', background: '#fff', border: `1px solid ${B[200]}`,
            color: B[400], cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = E.danger; e.currentTarget.style.borderColor = E.danger; }}
          onMouseLeave={e => { e.currentTarget.style.color = B[400]; e.currentTarget.style.borderColor = B[200]; }}
          ><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {/* Modern Switch Toggle */}
          <div style={{ 
            display: 'flex', background: B[100], padding: '0.4rem', borderRadius: '1.25rem', marginBottom: '2rem' 
          }}>
            <button
              type="button"
              onClick={() => setType('client')}
              style={{
                flex: 1, padding: '0.85rem', border: 'none', borderRadius: '1rem',
                fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                background: type === 'client' ? '#fff' : 'transparent',
                color: type === 'client' ? E.primary : B[500],
                boxShadow: type === 'client' ? '0 4px 12px rgba(59,130,246,0.1)' : 'none',
                transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
              }}
            >
              <UserPlus size={18} /> Client
            </button>
            <button
              type="button"
              onClick={() => setType('vendor')}
              style={{
                flex: 1, padding: '0.85rem', border: 'none', borderRadius: '1rem',
                fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                background: type === 'vendor' ? '#fff' : 'transparent',
                color: type === 'vendor' ? E.primary : B[500],
                boxShadow: type === 'vendor' ? '0 4px 12px rgba(59,130,246,0.1)' : 'none',
                transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
              }}
            >
              <Truck size={18} /> Vendor
            </button>
          </div>

          {/* Minimal Input */}
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: B[500], textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              {type === 'client' ? 'Client Name' : 'Vendor Name'}
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`Enter name here...`}
              style={{
                width: '100%', padding: '1.1rem 1.4rem', borderRadius: '1.25rem',
                border: `1.5px solid ${B[200]}`, outline: 'none', fontSize: '1rem',
                fontFamily: 'Plus Jakarta Sans, sans-serif', boxSizing: 'border-box', transition: 'all 0.2s',
                color: B[900], fontWeight: 600, background: '#fff'
              }}
              onFocus={e => { e.target.style.borderColor = E.primary; e.target.style.boxShadow = `0 0 0 4px rgba(59,130,246,0.1)`; }}
              onBlur={e => { e.target.style.borderColor = B[200]; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              width: '100%', padding: '1.1rem', background: E.primary, color: '#fff',
              border: 'none', borderRadius: '1.25rem', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              opacity: (loading || !name.trim()) ? 0.6 : 1, transition: 'all 0.3s',
              boxShadow: `0 8px 24px rgba(59, 130, 246, 0.25)`,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '1rem'
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = E.primaryDark)}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = E.primary)}
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Processing...' : 'Save to Directory'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
