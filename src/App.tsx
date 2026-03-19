/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { DataTable } from './components/DataTable';
import { StepTable } from './components/StepTable';
import { FMSRow, Step, STEPS, User as UserType, MasterData } from './types';
import { fetchData, saveData, loginUser } from './api';
import {
  LayoutDashboard, PlusCircle, Table as TableIcon, RefreshCw, Settings, Bell,
  ClipboardList, CheckCircle, IndianRupee, Users as UsersIcon, Truck, ExternalLink,
  Search, Download, CheckCircle2, AlertCircle, X, Clock, Building2, ChevronRight,
  User, Lock, LogOut
} from 'lucide-react';
import { cn } from './utils';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Warm Brown + White Design Tokens (injected as CSS vars) ─── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --brown-950: #1a0f08;
    --brown-900: #2d1810;
    --brown-800: #4a2c1a;
    --brown-700: #6b3f27;
    --brown-600: #8b5435;
    --brown-500: #a86b44;
    --brown-400: #c4895f;
    --brown-300: #d9a882;
    --brown-200: #e8c9aa;
    --brown-100: #f3e2d0;
    --brown-50:  #faf4ee;
    --cream-100: #fdf8f3;
    --cream-50:  #fffcf9;
    --gold:      #c9974a;
    --gold-light:#e8c47a;
    --text-primary: #1a0f08;
    --text-secondary: #6b3f27;
    --text-muted: #a86b44;
    --border: #e8c9aa;
    --border-light: #f3e2d0;
    --shadow-warm: 0 4px 24px rgba(107, 63, 39, 0.12);
    --shadow-card: 0 2px 16px rgba(74, 44, 26, 0.08);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream-100);
    color: var(--text-primary);
    min-height: 100vh;
  }

  h1, h2, h3, .serif { font-family: 'Playfair Display', serif; }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  .sidebar-active-glow {
    background: linear-gradient(135deg, var(--brown-800), var(--brown-600));
    box-shadow: 0 8px 24px rgba(74, 44, 26, 0.35);
  }

  .grain-overlay::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 999;
    opacity: 0.4;
  }

  input:focus { outline: none; }

  .card {
    background: #ffffff;
    border: 1px solid var(--border-light);
    border-radius: 1.5rem;
    box-shadow: var(--shadow-card);
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--brown-800) 0%, var(--brown-600) 100%);
    color: #fff;
    border: none;
    border-radius: 0.875rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    letter-spacing: 0.04em;
    transition: all 0.2s;
    box-shadow: 0 6px 20px rgba(74, 44, 26, 0.3);
    cursor: pointer;
  }
  .btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 0.875rem;
    color: var(--text-secondary);
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
  }
  .btn-ghost:hover { background: var(--brown-50); border-color: var(--brown-300); color: var(--brown-800); }

  .tag {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.65rem;
    border-radius: 99px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }
  .tag-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  .tag-warn    { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
  .tag-info    { background: var(--brown-50); color: var(--brown-700); border: 1px solid var(--brown-200); }

  .main-content {
    margin-left: 256px;
    transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .main-content.collapsed {
    margin-left: 76px;
  }

  @media (max-width: 1024px) {
    .main-content, .main-content.collapsed {
      margin-left: 0 !important;
    }
  }
`;

const STEP_ICONS: Record<string, React.ReactNode> = {
  'pi-received': <ClipboardList className="w-[18px] h-[18px]" />,
  'pi-approval': <CheckCircle className="w-[18px] h-[18px]" />,
  'payment-received': <IndianRupee className="w-[18px] h-[18px]" />,
  'partner-payout': <UsersIcon className="w-[18px] h-[18px]" />,
  'vendor-payment': <Truck className="w-[18px] h-[18px]" />,
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

/* ═══════════════════════════════ LOGIN PAGE ══════════════════════════════════ */
function LoginPage({ onLogin }: { onLogin: (user: UserType) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const user = await loginUser(username, password);
    if (user) { onLogin(user); } else { setError('Invalid credentials'); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, var(--cream-50) 0%, var(--brown-100) 50%, var(--brown-200) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-8%', left: '-8%', width: '40%', height: '40%',
        background: 'radial-gradient(circle, rgba(201,151,74,0.18) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-8%', right: '-8%', width: '45%', height: '45%',
        background: 'radial-gradient(circle, rgba(74,44,26,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      {/* Subtle ring decoration */}
      <div style={{
        position: 'absolute', top: '20%', right: '10%', width: 220, height: 220,
        border: '1px solid rgba(201,151,74,0.2)', borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: '22%', right: '12%', width: 170, height: 170,
        border: '1px solid rgba(201,151,74,0.12)', borderRadius: '50%', pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-light)',
          borderRadius: '2rem',
          padding: '3rem 2.5rem',
          boxShadow: '0 32px 80px rgba(74,44,26,0.18), 0 0 0 1px rgba(255,255,255,0.6)',
          position: 'relative', zIndex: 10
        }}
      >
        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 72, height: 72,
            background: 'linear-gradient(135deg, var(--brown-900), var(--brown-600))',
            borderRadius: '1.4rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 12px 32px rgba(74,44,26,0.35)',
            transform: 'rotate(3deg)'
          }}>
            <Building2 style={{ width: 32, height: 32, color: '#fff', transform: 'rotate(-3deg)' }} />
          </div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900,
            color: 'var(--brown-900)', letterSpacing: '-0.02em', lineHeight: 1
          }}>
            Welcome Back
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Sign in to your workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {[
            { label: 'Username', value: username, setter: setUsername, type: 'text', placeholder: 'Admin', Icon: User },
            { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '••••••••', Icon: Lock },
          ].map(({ label, value, setter, type, placeholder, Icon }) => (
            <div key={label}>
              <label style={{
                display: 'block', fontSize: '0.7rem', fontWeight: 700,
                color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem'
              }}>
                {label}
              </label>
              <div style={{ position: 'relative' }}>
                <Icon style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 18, height: 18, color: 'var(--brown-300)'
                }} />
                <input
                  type={type} value={value} required
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  style={{
                    width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
                    background: 'var(--cream-100)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '0.875rem',
                    fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--brown-600)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,84,53,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
          ))}

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '0.75rem 1rem', background: '#fff1f2', border: '1px solid #fecdd3',
                borderRadius: '0.75rem', textAlign: 'center', fontSize: '0.82rem', fontWeight: 600, color: '#be123c'
              }}>
              {error}
            </motion.div>
          )}

          <button type="submit" disabled={loading} className="btn-primary"
            style={{
              padding: '0.95rem', fontSize: '0.85rem', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
            {loading ? <RefreshCw style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : 'Sign In →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════ SIDEBAR BUTTON ═════════════════════════════ */
function SidebarButton({ active, onClick, icon, label, isCollapsed }: any) {
  return (
    <button onClick={onClick}
      title={isCollapsed ? label : ''}
      style={{
        width: '100%', display: 'flex', alignItems: 'center',
        gap: isCollapsed ? 0 : '0.7rem',
        padding: isCollapsed ? '0.75rem 0' : '0.7rem 0.9rem',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        borderRadius: '0.875rem',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: active ? 700 : 500,
        fontSize: '0.85rem',
        letterSpacing: '0.01em',
        position: 'relative',
        transition: 'all 0.2s',
        color: active ? '#fff' : 'var(--brown-600)',
        background: active
          ? 'linear-gradient(135deg, var(--brown-800), var(--brown-600))'
          : 'transparent',
        boxShadow: active ? '0 6px 20px rgba(74,44,26,0.28)' : 'none',
      }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brown-50)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--brown-800)'; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--brown-600)'; } }}
    >
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      {!isCollapsed && <span>{label}</span>}
      {active && !isCollapsed && (
        <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
      )}
    </button>
  );
}

/* ── Section header shared UI ── */
const SectionHeader = ({ title, subtitle, extra, searchQuery, setSearchQuery, onExport }: { 
  title: string; 
  subtitle: string; 
  extra?: React.ReactNode;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onExport: () => void;
}) => (
  <div style={{
    display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
    background: '#fff', border: '1px solid var(--border-light)',
    borderRadius: '1.5rem', padding: '1.25rem 1.25rem',
    boxShadow: 'var(--shadow-card)',
  }}>
    <div>
      <h3 style={{
        fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 700,
        color: 'var(--brown-900)', letterSpacing: '-0.01em'
      }}>{title}</h3>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{subtitle}</p>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative' }}>
        <Search style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          width: 16, height: 16, color: 'var(--brown-300)'
        }} />
        <input type="text" placeholder="Search PI, Party…" value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.6rem', paddingBottom: '0.6rem',
            background: 'var(--cream-100)', border: '1.5px solid var(--border)',
            borderRadius: '0.75rem', fontSize: '0.82rem', fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)', width: 240,
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--brown-600)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
      <button onClick={onExport} className="btn-ghost"
        style={{ padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center' }} title="Export CSV">
        <Download style={{ width: 17, height: 17 }} />
      </button>
      {extra}
    </div>
  </div>
);

/* ═══════════════════════════════ MAIN APP ═══════════════════════════════════ */
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [data, setData] = useState<FMSRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | Step>('dashboard');
  const [editingRow, setEditingRow] = useState<FMSRow | undefined>(undefined);
  const [initialStep, setInitialStep] = useState<Step>('pi-received');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showStepSelector, setShowStepSelector] = useState(false);
  const [selectorRow, setSelectorRow] = useState<FMSRow | undefined>(undefined);
  const [masterData, setMasterData] = useState<MasterData>({ parties: [], items: [] });

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { records, master } = await fetchData();
      setData(records);
      if (master) setMasterData(master);
    } catch { addToast('Failed to fetch data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const handleSave = async (formData: Partial<FMSRow>, step: Step) => {
    const success = await saveData(formData, step);
    if (success) {
      setShowForm(false);
      const isUpdate = !!editingRow;
      setEditingRow(undefined);
      addToast(isUpdate ? 'Transaction updated!' : 'Entry saved!', 'success');
      loadData();
    } else {
      addToast('Failed to save. Check configuration.', 'error');
    }
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(r => r.piNo.toLowerCase().includes(q) || r.partyName.toLowerCase().includes(q));
  }, [data, searchQuery]);

  const handleEdit = (row: FMSRow, step?: Step) => { setEditingRow(row); setInitialStep(step || 'pi-received'); setShowForm(true); };
  const openStep = (step: Step) => { setEditingRow(undefined); setInitialStep(step); setShowForm(true); };
  const handleUpdateStep = (row: FMSRow, step: Step) => { setEditingRow(row); setInitialStep(step); setShowForm(true); setShowStepSelector(false); };
  const openStepSelector = (row: FMSRow) => { setSelectorRow(row); setShowStepSelector(true); };

  const exportToCSV = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(r => Object.values(r).join(','));
    const uri = encodeURI("data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n"));
    const a = document.createElement("a");
    a.href = uri; a.download = `fms_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click();
    addToast('Exported to CSV', 'success');
  };

  const renderContent = () => {
    if (!user) return null;

    if (activeTab === 'dashboard')
      return user.permissions.overview
        ? <Dashboard data={data} />
        : <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Access Denied</div>;

    if (activeTab === 'table')
      return user.permissions.history ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <SectionHeader title="Financial Ledger" subtitle="Full audit of all transactions" 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery} onExport={exportToCSV} />
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <DataTable data={filteredData} onEdit={handleEdit} onOpenSelector={openStepSelector} />
          </motion.div>
        </div>
      ) : <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Access Denied</div>;

    const currentStep = STEPS.find(s => s.id === activeTab);
    if (!currentStep || !user.permissions[currentStep.id])
      return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Access Denied for this workflow step</div>;

    if (activeTab === 'pi-received' && !editingRow)
      return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 840, margin: '0 auto' }}>
          <EntryForm isInline onSave={handleSave} onClose={() => setActiveTab('dashboard')} allData={data} masterData={masterData} />
        </motion.div>
      );

    const stepData = filteredData.filter(row => {
      const step = activeTab as Step;
      switch (step) {
        case 'pi-approval': return !row.s2_actual;
        case 'payment-received': return !!row.s2_actual && row.approval === 'Approved' && (row.collectedAmount || 0) < (row.piAmount || 0);
        case 'partner-payout': return (row.collectedAmount || 0) > 0 && !row.s4_actual;
        case 'vendor-payment': return !!row.s4_actual && !row.s5_actual;
        default: return true;
      }
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <SectionHeader
          title={STEPS.find(s => s.id === activeTab)?.label || ''}
          subtitle={`Pending tasks — ${STEPS.find(s => s.id === activeTab)?.label}`}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} onExport={exportToCSV}
          extra={activeTab === 'pi-received' && (
            <button className="btn-primary" onClick={() => openStep('pi-received')}
              style={{ padding: '0.6rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PlusCircle style={{ width: 16, height: 16 }} /> New Entry
            </button>
          )}
        />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <StepTable data={stepData} step={activeTab as Step}
            onUpdate={async (row) => {
              const idx = STEPS.findIndex(s => s.id === activeTab) + 1;
              const key = `s${idx}_actual` as keyof FMSRow;
              // For payment-received, always open the form to allow entry of new payment amount
              if (activeTab === 'payment-received') {
                handleUpdateStep(row, activeTab as Step);
              } else if (row[key]) {
                await handleSave(row, activeTab as Step);
              } else {
                handleUpdateStep(row, activeTab as Step);
              }
            }}
          />
        </motion.div>
      </div>
    );
  };

  if (!user) return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <LoginPage onLogin={setUser} />
    </>
  );

  const visibleSteps = STEPS.filter(s => user.permissions[s.id]);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{
        display: 'flex', height: '100vh', background: 'var(--cream-100)',
        fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', position: 'relative'
      }}>

        {/* Ambient background blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: '-5%', left: '-5%', width: '35%', height: '35%',
            background: 'radial-gradient(circle, rgba(201,151,74,0.1) 0%, transparent 70%)', borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute', bottom: '-5%', right: '-5%', width: '40%', height: '40%',
            background: 'radial-gradient(circle, rgba(74,44,26,0.07) 0%, transparent 70%)', borderRadius: '50%'
          }} />
        </div>

        {/* ── Mobile backdrop ── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(26,15,8,0.35)',
                backdropFilter: 'blur(4px)', zIndex: 40
              }}
              className="lg:hidden" />
          )}
        </AnimatePresence>

        {/* ══════════ SIDEBAR ══════════ */}
        <aside style={{
          position: 'fixed',
          insetBlock: 0, left: 0,
          width: isSidebarCollapsed ? 76 : 256,
          background: '#fff',
          borderRight: '1px solid var(--border-light)',
          display: 'flex', flexDirection: 'column',
          zIndex: 50,
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 0 40px rgba(74,44,26,0.08)',
          transform: isSidebarOpen ? 'translateX(0)' : undefined,
        }}
          className={isSidebarOpen ? '' : '-translate-x-full lg:translate-x-0'}
        >
          {/* Logo row */}
          <div style={{
            padding: isSidebarCollapsed ? '1.25rem 0.75rem' : '1.5rem 1.25rem 1rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 38, height: 38, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--brown-900), var(--brown-600))',
                borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(74,44,26,0.3)', transform: 'rotate(3deg)'
              }}>
                <Building2 style={{ width: 19, height: 19, color: '#fff', transform: 'rotate(-3deg)' }} />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <div style={{
                    fontFamily: 'Playfair Display, serif', fontSize: '1rem', fontWeight: 700,
                    color: 'var(--brown-900)', letterSpacing: '-0.01em', lineHeight: 1
                  }}>App</div>
                  <div style={{
                    fontSize: '0.6rem', fontWeight: 700, color: 'var(--gold)',
                    letterSpacing: '0.12em', marginTop: 3, textTransform: 'uppercase'
                  }}>v2.0</div>
                </div>
              )}
            </div>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                display: 'none', padding: '0.35rem', background: 'var(--brown-50)',
                border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer',
                color: 'var(--brown-600)', transition: 'all 0.2s'
              }}
              className="!hidden lg:!flex items-center justify-center"
              title={isSidebarCollapsed ? 'Expand' : 'Collapse'}>
              <ChevronRight style={{
                width: 14, height: 14,
                transform: isSidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.3s'
              }} />
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0.75rem 0.6rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            className="no-scrollbar">

            <div>
              {!isSidebarCollapsed && (
                <div style={{
                  fontSize: '0.6rem', fontWeight: 700, color: 'var(--brown-300)',
                  letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 0.4rem', marginBottom: '0.4rem'
                }}>
                  MAIN
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                {user.permissions.overview && (
                  <SidebarButton active={activeTab === 'dashboard'} icon={<LayoutDashboard style={{ width: 18, height: 18 }} />}
                    label="Overview" isCollapsed={isSidebarCollapsed}
                    onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
                )}
                {user.permissions.history && (
                  <SidebarButton active={activeTab === 'table'} icon={<TableIcon style={{ width: 18, height: 18 }} />}
                    label="History" isCollapsed={isSidebarCollapsed}
                    onClick={() => { setActiveTab('table'); setIsSidebarOpen(false); }} />
                )}
              </div>
            </div>

            <div>
              {!isSidebarCollapsed && (
                <div style={{
                  fontSize: '0.6rem', fontWeight: 700, color: 'var(--brown-300)',
                  letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 0.4rem', marginBottom: '0.4rem'
                }}>
                  WORKFLOW
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                {visibleSteps.map(step => (
                  <SidebarButton key={step.id} active={activeTab === step.id}
                    icon={STEP_ICONS[step.id]} label={step.label} isCollapsed={isSidebarCollapsed}
                    onClick={() => { setActiveTab(step.id); setIsSidebarOpen(false); }} />
                ))}
              </div>
            </div>
          </nav>

          {/* User card */}
          <div style={{
            padding: isSidebarCollapsed ? '0.75rem 0.5rem' : '0.75rem 0.75rem',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--brown-50)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: isSidebarCollapsed ? 0 : '0.6rem',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              background: '#fff', padding: '0.6rem',
              borderRadius: '0.875rem', border: '1px solid var(--border-light)'
            }}>
              <div style={{
                width: 34, height: 34, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--brown-800), var(--gold))',
                borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User style={{ width: 17, height: 17, color: '#fff' }} />
              </div>
              {!isSidebarCollapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8rem', fontWeight: 700, color: 'var(--brown-900)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {user.username}
                  </div>
                  <div style={{
                    fontSize: '0.62rem', fontWeight: 600, color: 'var(--gold)',
                    textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 1
                  }}>Active</div>
                </div>
              )}
              <button onClick={() => setUser(null)} title="Logout"
                style={{
                  padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--brown-400)', borderRadius: '0.5rem', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#be123c'; (e.currentTarget as HTMLButtonElement).style.background = '#fff1f2'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--brown-400)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                <LogOut style={{ width: 17, height: 17 }} />
              </button>
            </div>
          </div>
        </aside>

        {/* ══════════ MAIN CONTENT ══════════ */}
        <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          position: 'relative', zIndex: 30, overflow: 'hidden',
          minWidth: 0,
        }}>
          {/* Topbar */}
          <header style={{
            height: 68, background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--border-light)',
            padding: '0 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 30, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <button onClick={() => setIsSidebarOpen(true)}
                style={{
                  padding: '0.5rem', background: '#fff', border: '1px solid var(--border)',
                  borderRadius: '0.6rem', cursor: 'pointer', color: 'var(--brown-600)',
                  display: 'flex', alignItems: 'center'
                }}
                className="lg:hidden">
                <LayoutDashboard style={{ width: 18, height: 18 }} />
              </button>
              <div className="hidden lg:block">
                <div style={{
                  fontSize: '0.62rem', fontWeight: 700, color: 'var(--gold)',
                  letterSpacing: '0.12em', textTransform: 'uppercase'
                }}>WORKSPACE</div>
                <h2 style={{
                  fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700,
                  color: 'var(--brown-900)', letterSpacing: '-0.01em', lineHeight: 1, marginTop: 2
                }}>
                  {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'table' ? 'Ledger' : STEPS.find(s => s.id === activeTab)?.label}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.85rem', background: 'var(--brown-50)',
                border: '1px solid var(--border)', borderRadius: '99px'
              }}>
                <div style={{ position: 'relative', width: 8, height: 8 }}>
                  <div style={{ width: 8, height: 8, background: '#16a34a', borderRadius: '50%' }} />
                  <div style={{
                    position: 'absolute', inset: 0, width: 8, height: 8, background: '#16a34a',
                    borderRadius: '50%', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite', opacity: 0.6
                  }} />
                </div>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700, color: 'var(--brown-700)',
                  letterSpacing: '0.1em', textTransform: 'uppercase'
                }}>Live</span>
              </div>
              <button onClick={loadData}
                style={{
                  padding: '0.55rem', background: '#fff', border: '1px solid var(--border)',
                  borderRadius: '0.6rem', cursor: 'pointer', color: 'var(--brown-500)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--brown-800)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--brown-50)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--brown-500)'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}>
                <RefreshCw style={{ width: 17, height: 17, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>
          </header>

          {/* Page content */}
          <div style={{ flex: 1, padding: '1.75rem 2rem', overflowY: 'auto' }} className="no-scrollbar">
            {renderContent()}
          </div>

          {/* ── Toasts ── */}
          <div style={{
            position: 'fixed', bottom: '1.75rem', right: '1.75rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 100
          }}>
            <AnimatePresence>
              {toasts.map(t => (
                <motion.div key={t.id}
                  initial={{ opacity: 0, y: 24, x: 12 }} animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.85rem 1.25rem',
                    background: t.type === 'success' ? '#f0fdf4' : '#fff1f2',
                    border: `1px solid ${t.type === 'success' ? '#bbf7d0' : '#fecdd3'}`,
                    borderRadius: '1rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    minWidth: 280,
                  }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '0.6rem', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: t.type === 'success' ? '#16a34a' : '#e11d48',
                    boxShadow: `0 4px 12px ${t.type === 'success' ? 'rgba(22,163,74,0.3)' : 'rgba(225,29,72,0.3)'}`
                  }}>
                    {t.type === 'success'
                      ? <CheckCircle2 style={{ width: 17, height: 17, color: '#fff' }} />
                      : <AlertCircle style={{ width: 17, height: 17, color: '#fff' }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--brown-900)' }}>
                      {t.type === 'success' ? 'Success' : 'Error'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>{t.message}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* ── Entry Form modal ── */}
        {showForm && (
          <EntryForm
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingRow(undefined); setInitialStep('pi-received'); }}
            initialData={editingRow} initialStep={initialStep} allData={data} masterData={masterData}
          />
        )}

        {/* ── Step Selector Modal ── */}
        <AnimatePresence>
          {showStepSelector && selectorRow && (
            <div style={{
              position: 'fixed', inset: 0,
              background: 'rgba(26,15,8,0.35)', backdropFilter: 'blur(8px)',
              zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}>
              <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                style={{
                  background: '#fff', borderRadius: '1.75rem',
                  boxShadow: '0 32px 80px rgba(74,44,26,0.25)',
                  padding: '1.75rem', width: '100%', maxWidth: 420,
                  border: '1px solid var(--border-light)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{
                      fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700,
                      color: 'var(--brown-900)'
                    }}>Select Action</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>
                      Update workflow for <strong>{selectorRow.piNo}</strong>
                    </p>
                  </div>
                  <button onClick={() => setShowStepSelector(false)}
                    style={{
                      padding: '0.35rem', background: 'var(--brown-50)',
                      border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer',
                      color: 'var(--brown-500)', display: 'flex', alignItems: 'center'
                    }}>
                    <X style={{ width: 15, height: 15 }} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {STEPS.filter(s => user?.permissions[s.id]).map((step, idx) => {
                    const done = !!selectorRow[`s${idx + 1}_actual` as keyof FMSRow];
                    return (
                      <button key={step.id} onClick={() => handleUpdateStep(selectorRow, step.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.85rem 1rem',
                          background: done ? '#f0fdf4' : 'var(--brown-50)',
                          border: `1.5px solid ${done ? '#bbf7d0' : 'var(--border)'}`,
                          borderRadius: '0.875rem', cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left'
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = done ? '#4ade80' : 'var(--brown-400)'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = done ? '#bbf7d0' : 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = done ? '#f0fdf4' : 'var(--brown-50)'; }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '0.65rem', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: done ? '#dcfce7' : '#fff',
                          color: done ? '#16a34a' : 'var(--brown-700)',
                          border: `1px solid ${done ? '#bbf7d0' : 'var(--border)'}`,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                        }}>
                          {STEP_ICONS[step.id]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)',
                            letterSpacing: '0.1em', textTransform: 'uppercase'
                          }}>Step {idx + 1}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brown-900)', marginTop: 1 }}>
                            {step.label}
                          </div>
                        </div>
                        {done
                          ? <CheckCircle2 style={{ width: 17, height: 17, color: '#16a34a', flexShrink: 0 }} />
                          : <ChevronRight style={{ width: 15, height: 15, color: 'var(--brown-300)', flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => handleEdit(selectorRow)} className="btn-primary"
                  style={{
                    width: '100%', padding: '0.85rem', fontSize: '0.82rem',
                    letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                  Edit Full Details
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyframe for spinner & ping */}
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes ping  { 75%,100% { transform: scale(2); opacity: 0; } }
        .hidden { display: none !important; }
        @media(min-width:1024px){ .lg\\:hidden { display:none!important; } .lg\\:block { display:block!important; } .lg\\:translate-x-0 { transform:translateX(0)!important; } }
      `}</style>
    </>
  );
}