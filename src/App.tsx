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
import { fetchData, saveData, formatTimestamp } from './api';
import {
  LayoutDashboard, PlusCircle, Table as TableIcon, RefreshCw, Settings, Bell,
  ClipboardList, CheckCircle, IndianRupee, Users as UsersIcon, Truck, ExternalLink,
  Search, Download, CheckCircle2, AlertCircle, X, Clock, Building2, ChevronRight,
  User, Activity, Wallet
} from 'lucide-react';
import { cn, downloadCSV } from './utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentRecord } from './types';
import { LoginView } from './components/LoginView';
import { ClientDashboardView } from './components/ClientDashboardView';
import { ClientInsightsView } from './components/ClientInsightsView';
import { PaymentLedgerView } from './components/PaymentLedgerView';
import { MasterEntryForm } from './components/MasterEntryForm';
import { loginUser } from './api';
import { LogOut } from 'lucide-react';

/* ─── Premium Lite Blue & White Design Tokens ─── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  :root {
    /* Core Lite Blue Palette */
    --primary-blue: #3b82f6;
    --primary-blue-dark: #2563eb;
    --primary-blue-light: #60a5fa;
    --secondary-blue: #eff6ff;
    
    /* Neutral / White */
    --white: #ffffff;
    --bg-main: #f8fafc;
    --bg-card: #ffffff;
    
    /* Text */
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    
    /* Accents */
    --accent-success: #10b981;
    --accent-warning: #f59e0b;
    --accent-danger: #ef4444;
    
    /* Borders & Shadows */
    --border: rgba(226, 232, 240, 0.8);
    --border-light: rgba(226, 232, 240, 0.4);
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    --shadow-premium: 0 10px 30px -10px rgba(59, 130, 246, 0.15);
    
    --radius-xl: 1.25rem;
    --radius-2xl: 1.5rem;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg-main);
    color: var(--text-primary);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, .serif { font-family: 'Outfit', sans-serif; }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  .premium-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-premium);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .premium-card:hover { 
    transform: translateY(-4px); 
    box-shadow: 0 20px 40px -12px rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.2);
  }

  .sidebar-active {
    background: var(--primary-blue) !important;
    color: #ffffff !important;
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  }

  .btn-action {
    background: var(--primary-blue);
    color: #fff;
    border: none;
    border-radius: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
  }
  .btn-action:hover { filter: brightness(1.05); transform: translateY(-1px); }
  .btn-action:active { transform: translateY(0); }

  .grain-overlay::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 999;
    opacity: 0.2;
  }

  input:focus { outline: none; }

  .card {
    background: #ffffff;
    border: 1px solid var(--border-light);
    border-radius: 1.5rem;
    box-shadow: var(--shadow-sm);
  }

  .btn-primary {
    background: var(--primary-blue);
    color: #fff;
    border: none;
    border-radius: 0.875rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    letter-spacing: 0.02em;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    cursor: pointer;
  }
  .btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 0.875rem;
    color: var(--text-secondary);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    transition: all 0.2s;
    cursor: pointer;
  }
  .btn-ghost:hover { background: var(--secondary-blue); border-color: var(--primary-blue-light); color: var(--primary-blue-dark); }

  .tag {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .tag-success { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }
  .tag-warn    { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
  .tag-info    { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }

  .main-content {
    margin-left: 256px;
    transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .main-content.collapsed {
    margin-left: 76px;
  }
  .content-wrapper {
    padding: 2rem;
  }

  @media (max-width: 1024px) {
    .main-content, .main-content.collapsed {
      margin-left: 0 !important;
    }
  }

  @media (max-width: 768px) {
    .content-wrapper { padding: 1.25rem !important; }
    .premium-card { padding: 1.25rem !important; }
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

const DEFAULT_USER: UserType | null = null;

/* ═══════════════════════════════ SIDEBAR BUTTON ═════════════════════════════ */
function SidebarButton({ active, onClick, icon, label, isCollapsed }: any) {
  return (
    <button onClick={onClick}
      title={isCollapsed ? label : ''}
      style={{
        width: '100%', display: 'flex', alignItems: 'center',
        gap: isCollapsed ? 0 : '1rem',
        padding: isCollapsed ? '0.85rem 0' : '0.85rem 1.25rem',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        borderRadius: '1rem',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontWeight: active ? 700 : 500,
        fontSize: '0.88rem',
        letterSpacing: '0.01em',
        position: 'relative',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        color: active ? '#fff' : 'var(--text-secondary)',
        background: active ? 'var(--primary-blue)' : 'transparent',
        boxShadow: active ? '0 8px 20px rgba(59,130,246,0.25)' : 'none',
      }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--secondary-blue)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-blue)'; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; } }}
    >
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, opacity: active ? 1 : 0.8 }}>{icon}</span>
      {!isCollapsed && <span style={{ transition: 'opacity 0.2s' }}>{label}</span>}
      {active && !isCollapsed && (
        <motion.div layoutId="active-indicator" style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
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
  onExport?: () => void;
}) => (
  <div style={{
    display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem',
    background: '#fff', border: '1px solid var(--border)',
    borderRadius: '1.5rem', padding: '1.5rem',
    boxShadow: 'var(--shadow-premium)',
  }}>
    <div>
      <h3 style={{
        fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800,
        color: 'var(--text-primary)', letterSpacing: '-0.01em'
      }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{subtitle}</p>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative' }}>
        <Search style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          width: 16, height: 16, color: 'var(--primary-blue)'
        }} />
        <input type="text" placeholder="Search records..." value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem',
            background: 'var(--bg-main)', border: '1.5px solid var(--border)',
            borderRadius: '1rem', fontSize: '0.88rem', fontWeight: 500,
            fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text-primary)', width: '100%', minWidth: '200px', maxWidth: '260px',
            transition: 'all 0.2s'
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--primary-blue)'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
      {onExport && (
        <button onClick={onExport} className="btn-ghost"
          style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', borderRadius: '1rem' }} title="Export CSV">
          <Download style={{ width: 18, height: 18 }} />
        </button>
      )}
      {extra}
    </div>
  </div>
);

/* ═══════════════════════════════ MAIN APP ═══════════════════════════════════ */
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<UserType | null>(DEFAULT_USER);
  const [data, setData] = useState<FMSRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMasterForm, setShowMasterForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | Step | 'client-dashboard' | 'client-insights' | 'partner-ledger' | 'vendor-ledger'>('dashboard');
  const [vendorPayments, setVendorPayments] = useState<PaymentRecord[]>([]);
  const [partnerPayments, setPartnerPayments] = useState<PaymentRecord[]>([]);
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
      const res = await fetchData();
      setData(res.records);
      setVendorPayments(res.vendorPayments);
      setPartnerPayments(res.partnerPayments);
      if (res.master) setMasterData(res.master);
    } catch { addToast('Failed to fetch data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    const savedUser = localStorage.getItem('fms_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('fms_user');
      }
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const userData = await loginUser(username, password);
    if (userData) {
      setUser(userData);
      localStorage.setItem('fms_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fms_user');
    setActiveTab('dashboard');
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const handleSave = async (formData: Partial<FMSRow>, step: Step, stayOpen = false) => {
    // Optimistic UI Update: We update the local state immediately so the app feels instant.
    const isUpdate = !!editingRow;
    const newRow: FMSRow = {
      ...(editingRow || {
        timestamp: formatTimestamp(),
        piNo: '',
        partyName: '',
        piAmount: 0,
        items: [],
        remark: '',
        collectedAmount: 0,
        amount: 0,
        vendorAmount: 0,
        vendorName: '',
        approval: '',
        note: '',
        s1_planned: '', s1_actual: '', s1_delay: '',
        s2_planned: '', s2_actual: '', s2_delay: '',
        s3_planned: '', s3_actual: '', s3_delay: '',
        s4_planned: '', s4_actual: '', s4_delay: '',
        s5_planned: '', s5_actual: '', s5_delay: '',
      }),
      ...formData,
      originalTimestamp: editingRow?.originalTimestamp || formData.timestamp,
      originalPiNo: editingRow?.originalPiNo || formData.piNo,
    };

    if (isUpdate && editingRow) {
      setData(prev => prev.map(r =>
        (r.piNo === editingRow.piNo) ? newRow : r
      ));
    } else {
      setData(prev => [newRow, ...prev]);
    }

    if (!stayOpen) {
      setShowForm(false);
      setEditingRow(undefined);
    }

    addToast(isUpdate ? 'Updating...' : 'Saving...', 'success');

    const sheetName = step === 'vendor-payment' ? 'Vendor Payment' : step === 'partner-payout' ? 'Partner Pay' : undefined;
    const payload = { ...formData, sheetName };
    const success = await saveData(payload, step);
    if (success) {
      addToast(isUpdate ? 'Entry updated!' : 'Entry saved!', 'success');
      loadData(); // Re-sync with actual sheet data
    } else {
      addToast('Sync failed. Please refresh.', 'error');
      loadData(); // Rollback to actual sheet data
    }
  };

  const handleSaveMaster = async (newEntry: { partyName?: string; vendorName?: string }) => {
    const updatedMaster = { ...masterData };
    if (newEntry.partyName && !updatedMaster.parties.includes(newEntry.partyName)) {
      updatedMaster.parties = [...updatedMaster.parties, newEntry.partyName];
    }
    if (newEntry.vendorName && !updatedMaster.items.includes(newEntry.vendorName)) {
      updatedMaster.items = [...updatedMaster.items, newEntry.vendorName];
    }

    setMasterData(updatedMaster); // Optimistic UI update
    const success = await saveData(updatedMaster, 'save-master');
    if (success) {
      addToast('Directory updated successfully!', 'success');
      setShowMasterForm(false);
      loadData();
    } else {
      addToast('Failed to update directory', 'error');
    }
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(r => r.piNo.toLowerCase().includes(q) || r.partyName.toLowerCase().includes(q));
  }, [data, searchQuery]);

  const handleEdit = (row: FMSRow, step?: Step) => { setEditingRow(row); setInitialStep(step || 'pi-received'); setShowForm(true); };
  const handleVendorProcess = (row: FMSRow) => { setEditingRow(row); setInitialStep('vendor-payment'); setShowForm(true); };
  const handlePartnerProcess = (row: FMSRow) => { setEditingRow(row); setInitialStep('partner-payout'); setShowForm(true); };
  const handleCollectProcess = (row: FMSRow) => { setEditingRow(row); setInitialStep('payment-received'); setShowForm(true); };
  const openStep = (step: Step) => { setEditingRow(undefined); setInitialStep(step); setShowForm(true); };
  const handleUpdateStep = (row: FMSRow, step: Step) => { setEditingRow(row); setInitialStep(step); setShowForm(true); setShowStepSelector(false); };
  const openStepSelector = (row: FMSRow) => { setSelectorRow(row); setShowStepSelector(true); };



  const renderContent = () => {
    if (!user) return null;

    if (activeTab === 'dashboard') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <button
              onClick={() => setShowMasterForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem',
                background: 'var(--secondary-blue)', color: 'var(--primary-blue)', border: '1.5px solid var(--border)',
                borderRadius: '0.875rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--secondary-blue)')}
            >
              <PlusCircle size={16} /> Quick Add Master
            </button>
          </div>
          <Dashboard data={data} onUpdateStep={handleUpdateStep} onEdit={handleEdit} onOpenStep={openStep} />
        </div>
      );
    }

    if (activeTab === 'table')
      return user.permissions.history ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <SectionHeader title="Financial Ledger" subtitle="Full audit of all transactions"
            searchQuery={searchQuery} setSearchQuery={setSearchQuery} onExport={() => downloadCSV(filteredData, `ledger_${new Date().toISOString().split('T')[0]}.csv`)} />
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <DataTable data={filteredData} onEdit={handleEdit} onOpenSelector={openStepSelector} />
          </motion.div>
        </div>
      ) : <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Access Denied</div>;

    if (activeTab === 'client-dashboard') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SectionHeader title="Client Dashboard" subtitle="" searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <ClientDashboardView data={filteredData} />
        </div>
      );
    }

    if (activeTab === 'partner-ledger') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <PaymentLedgerView
            title="Partner Pay Dashboard"
            subtitle="History of all payouts to partners"
            data={partnerPayments}
            allRecords={data}
            type="partner"
          />
        </div>
      );
    }

    if (activeTab === 'vendor-ledger') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <PaymentLedgerView
            title="Vendor Pay Dashboard"
            subtitle="Detailed history of vendor disbursements"
            data={vendorPayments}
            allRecords={data}
            type="vendor"
          />
        </div>
      );
    }

    if (activeTab === 'client-insights') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SectionHeader title="Client Insights" subtitle="" searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <ClientInsightsView
            data={filteredData}
            onPayVendor={handleVendorProcess}
            onPayPartner={handlePartnerProcess}
            onCollect={handleCollectProcess}
            onInlineSave={(updatedRow) => handleSave(updatedRow, 'pi-received')}
          />
        </div>
      );
    }

    const currentStep = STEPS.find(s => s.id === activeTab);
    if (!currentStep || !user.permissions[currentStep.id])
      return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Access Denied for this workflow step</div>;

    let stepData = filteredData.filter(row => {
      const step = activeTab as Step;
      switch (step) {
        case 'pi-approval': return !row.approval;
        case 'payment-received': return row.approval === 'Approved' && (row.collectedAmount || 0) < (row.piAmount || 0);
        case 'partner-payout': return (row.collectedAmount || 0) > 0 && (row.amount || 0) === 0;
        case 'vendor-payment': return (row.amount || 0) > 0 && (row.vendorAmount || 0) === 0;
        default: return true;
      }
    });

    if (activeTab === 'pi-approval') {
      stepData = [...stepData].sort((a, b) => (a.partyName || '').localeCompare(b.partyName || ''));
    }

    const totalStepAmount = stepData.reduce((sum, row) => sum + (row.piAmount || 0), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <SectionHeader
          title={STEPS.find(s => s.id === activeTab)?.label || ''}
          subtitle={`Pending tasks — ${STEPS.find(s => s.id === activeTab)?.label}`}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} onExport={() => downloadCSV(stepData, `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`)}
          extra={(
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {totalStepAmount > 0 && (
                <div style={{
                  padding: '0.55rem 1rem', background: 'var(--secondary-blue)', border: '1.5px solid var(--border)',
                  borderRadius: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.05)'
                }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₹{totalStepAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              )}
              {activeTab === 'pi-received' && (
                <button className="btn-primary" onClick={() => openStep('pi-received')}
                  style={{ padding: '0.6rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <PlusCircle style={{ width: 16, height: 16 }} /> New Entry
                </button>
              )}
            </div>
          )}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <StepTable data={stepData} step={activeTab as Step}
            onUpdate={async (row) => {
              const idx = STEPS.findIndex(s => s.id === activeTab) + 1;
              const key = `s${idx}_actual` as keyof FMSRow;
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

  if (!user) return <LoginView onLogin={handleLogin} />;

  const visibleSteps = STEPS.filter(s => user.permissions[s.id]);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{
        display: 'flex', height: '100vh', background: 'var(--bg-main)',
        fontFamily: 'Outfit, sans-serif', overflow: 'hidden', position: 'relative',
        flexDirection: 'column'
      }}>
        
        {/* ── Mobile Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.85rem 1.25rem', background: '#fff', borderBottom: '1px solid var(--border)',
          zIndex: 45, position: 'sticky', top: 0
        }} className="lg:hidden">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 34, height: 34, background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
              borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)'
            }}>
              <Building2 style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>PI TRACKER</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{ 
              padding: '0.5rem', background: 'var(--secondary-blue)', border: 'none', 
              borderRadius: '0.75rem', color: 'var(--primary-blue)'
            }}
          >
            <Activity size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Ambient background blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: '-5%', left: '-5%', width: '35%', height: '35%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute', bottom: '-5%', right: '-5%', width: '40%', height: '40%',
            background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)', borderRadius: '50%'
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
        <aside 
          style={{
            width: isSidebarCollapsed ? 76 : 256,
            background: '#fff',
            borderRight: '1px solid var(--border-light)',
            display: 'flex', flexDirection: 'column',
            zIndex: 50,
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 0 40px rgba(0,0,0,0.08)',
          }}
          className={cn(
            "fixed inset-y-0 left-0 lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
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
                background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
                borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(59,130,246,0.3)', transform: 'rotate(2deg)'
              }}>
                <Building2 style={{ width: 19, height: 19, color: '#fff', transform: 'rotate(-2deg)' }} />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <div style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 800,
                    color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1
                  }}>Tracker</div>
                  <div style={{
                    fontSize: '0.6rem', fontWeight: 700, color: 'var(--gold)',
                    letterSpacing: '0.12em', marginTop: 3, textTransform: 'uppercase'
                  }}></div>
                </div>
              )}
            </div>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                display: 'none', padding: '0.35rem', background: 'var(--secondary-blue)',
                border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer',
                color: 'var(--primary-blue)', transition: 'all 0.2s'
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
                  fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)',
                  letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.5rem'
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
                <SidebarButton active={activeTab === 'client-dashboard'} icon={<Activity style={{ width: 18, height: 18 }} />}
                  label="Client Dashboard" isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('client-dashboard'); setIsSidebarOpen(false); }} />
                <SidebarButton active={activeTab === 'client-insights'} icon={<Search style={{ width: 18, height: 18 }} />}
                  label="Client Insights" isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('client-insights'); setIsSidebarOpen(false); }} />

                {!isSidebarCollapsed && (
                  <div style={{
                    fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)',
                    letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.75rem', margin: '1rem 0 0.5rem'
                  }}>
                    LEDGERS
                  </div>
                )}
                <SidebarButton active={activeTab === 'partner-ledger'} icon={<Wallet style={{ width: 18, height: 18 }} />}
                  label="Partner Ledger" isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('partner-ledger'); setIsSidebarOpen(false); }} />
                <SidebarButton active={activeTab === 'vendor-ledger'} icon={<Truck style={{ width: 18, height: 18 }} />}
                  label="Vendor Ledger" isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('vendor-ledger'); setIsSidebarOpen(false); }} />
              </div>
            </div>

            <div>
              {!isSidebarCollapsed && (
                <div style={{
                  fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)',
                  letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.5rem'
                }}>
                  WORKFLOW
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                {visibleSteps
                  .filter(step => !['pi-approval', 'payment-received', 'partner-payout', 'vendor-payment'].includes(step.id))
                  .map(step => (
                    <SidebarButton key={step.id} active={activeTab === step.id}
                      icon={STEP_ICONS[step.id]} label={step.label} isCollapsed={isSidebarCollapsed}
                      onClick={() => { setActiveTab(step.id); setIsSidebarOpen(false); }} />
                  ))}
              </div>
            </div>
          </nav>

          <div style={{
            padding: isSidebarCollapsed ? '0.75rem 0.5rem' : '0.75rem 0.75rem',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-main)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: isSidebarCollapsed ? 0 : '0.6rem',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              background: '#fff', padding: '0.6rem',
              borderRadius: '0.875rem', border: '1px solid var(--border-light)',
              position: 'relative'
            }}>
              <div style={{
                width: 34, height: 34, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light))',
                borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '0.85rem', fontWeight: 800
              }}>
                {user.username[0].toUpperCase()}
              </div>
              {!isSidebarCollapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {user.username}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active</span>
                  </div>
                </div>
              )}
              {!isSidebarCollapsed && (
                <button 
                  onClick={handleLogout}
                  style={{ 
                    padding: '0.4rem', borderRadius: '0.5rem', background: 'transparent', 
                    border: 'none', color: 'var(--accent-danger)',
                    cursor: 'pointer', display: 'flex', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fff1f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ══════════ MAIN CONTENT ══════════ */}
        <main 
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            position: 'relative', zIndex: 30, overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {/* Topbar */}
          <header style={{
            height: 68, background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--border-light)',
            padding: '0 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 30, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <button onClick={() => setIsSidebarOpen(true)}
                style={{
                  padding: '0.5rem', background: '#fff', border: '1px solid var(--border)',
                  borderRadius: '0.6rem', cursor: 'pointer', color: 'var(--primary-blue)',
                  display: 'flex', alignItems: 'center'
                }}
                className="lg:hidden">
                <LayoutDashboard style={{ width: 18, height: 18 }} />
              </button>
              <div className="hidden lg:block">
                <h2 style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800,
                  color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1, marginTop: 2
                }}>
                  {activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab === 'table' ? 'Financial Ledger' : STEPS.find(s => s.id === activeTab)?.label}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.85rem', background: 'var(--secondary-blue)',
                border: '1px solid var(--border)', borderRadius: '99px'
              }} className="mobile-hide">
                <div style={{ position: 'relative', width: 8, height: 8 }}>
                  <div style={{ width: 8, height: 8, background: '#16a34a', borderRadius: '50%' }} />
                  <div style={{
                    position: 'absolute', inset: 0, width: 8, height: 8, background: '#16a34a',
                    borderRadius: '50%', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite', opacity: 0.6
                  }} />
                </div>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 800, color: 'var(--primary-blue)',
                  letterSpacing: '0.1em', textTransform: 'uppercase'
                }}>Live Sync</span>
              </div>
              <button onClick={loadData}
                style={{
                  padding: '0.55rem', background: '#fff', border: '1px solid var(--border)',
                  borderRadius: '0.6rem', cursor: 'pointer', color: 'var(--text-secondary)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-blue)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--secondary-blue)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}>
                <RefreshCw style={{ width: 17, height: 17, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>
          </header>

          {/* Page content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }} className="no-scrollbar content-wrapper mobile-padding">
            <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
            <div style={{ height: '4rem' }} /> {/* Mobile Bottom Spacer */}
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
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      {t.type === 'success' ? 'Success' : 'Error'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 1 }}>{t.message}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>

        {/* ── Entry Form modal ── */}
        {showForm && (
          <EntryForm
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingRow(undefined); setInitialStep('pi-received'); }}
            initialData={editingRow} initialStep={initialStep} allData={data} masterData={masterData}
          />
        )}

        {showMasterForm && (
          <MasterEntryForm
            onClose={() => setShowMasterForm(false)}
            onSave={handleSaveMaster}
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
                      fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800,
                      color: 'var(--text-primary)'
                    }}>Select Action</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 3, fontWeight: 500 }}>
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
                          background: done ? '#f0fdf4' : 'var(--bg-main)',
                          border: `1.5px solid ${done ? '#bbf7d0' : 'var(--border)'}`,
                          borderRadius: '0.875rem', cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left'
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = done ? '#4ade80' : 'var(--primary-blue)'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = done ? '#bbf7d0' : 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = done ? '#f0fdf4' : 'var(--bg-main)'; }}>
                        <div style={{
                                   boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                        }}>
                          {STEP_ICONS[step.id]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)',
                            letterSpacing: '0.1em', textTransform: 'uppercase'
                          }}>Step {idx + 1}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 1 }}>
                            {step.label}
                          </div>
                        </div>
                        {done
                          ? <CheckCircle2 style={{ width: 17, height: 17, color: '#16a34a', flexShrink: 0 }} />
                          : <ChevronRight style={{ width: 15, height: 15, color: 'var(--text-muted)', flexShrink: 0 }} />}
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }
        .hidden { display: none !important; }
        @media(min-width:1024px){ 
          .lg\\:hidden { display:none!important; } 
          .lg\\:block { display:block!important; } 
          .lg\\:translate-x-0 { transform:translateX(0)!important; } 
        }
      `}</style>
    </>
  );
}