// ClientInsightsView.tsx — Premium Earth-Light Theme
import React, { useState } from 'react';
import { FMSRow } from '../types';
import { formatCurrency, downloadCSV } from '../utils';
import { 
  User, ChevronDown, IndianRupee, Truck, 
  ClipboardList, CheckCircle2, Download,
  Clock, Wallet, Edit3, Save, X, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: FMSRow[];
  onPayVendor: (row: FMSRow) => void;
  onPayPartner: (row: FMSRow) => void;
  onCollect: (row: FMSRow) => void;
  onInlineSave: (updatedRow: FMSRow) => void;
}

const E = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#eff6ff',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: 'var(--text-primary)',
  muted: 'var(--text-secondary)',
  border: 'var(--border)',
  bg: 'var(--bg-main)'
};

export const ClientInsightsView: React.FC<Props> = ({ data, onPayVendor, onPayPartner, onCollect, onInlineSave }) => {
  const clients = Array.from(new Set(data.map(r => r.partyName))).filter(Boolean).sort();
  const [selectedClient, setSelectedClient] = useState(clients[0] || '');
  const [editingPiNo, setEditingPiNo] = useState<string | null>(null);
  const [editData, setEditData] = useState<FMSRow | null>(null);

  const clientData = data.filter(r => r.partyName === selectedClient);
  const totalSales = clientData.reduce((sum, r) => sum + (r.piAmount || 0), 0);
  const totalPurchase = clientData.reduce((sum, r) => sum + (r.totalPurchaseAmount || 0), 0);
  const totalVendorPaid = clientData.reduce((sum, r) => sum + (r.actualAmount || 0), 0);
  const totalPartnerPaid = clientData.reduce((sum, r) => sum + (r.amount || 0), 0);

  const stats = [
    { label: 'Sales Volume', val: totalSales, icon: <IndianRupee />, color: E.primary },
    { label: 'Purchase Amt', val: totalPurchase, icon: <Clock />, color: E.primaryDark },
    { label: 'Vendor Paid', val: totalVendorPaid, icon: <Truck />, color: E.danger },
    { label: 'Partner Paid', val: totalPartnerPaid, icon: <Wallet />, color: E.success },
  ];

  const handleStartEdit = (row: FMSRow) => {
    setEditingPiNo(row.piNo);
    setEditData({ ...row });
  };

  const handleCancel = () => {
    setEditingPiNo(null);
    setEditData(null);
  };

  const handleSave = () => {
    if (editData) {
      onInlineSave(editData);
      setEditingPiNo(null);
      setEditData(null);
    }
  };

  const updateField = (field: keyof FMSRow, value: any) => {
    if (editData) setEditData({ ...editData, [field]: value });
  };

  const handleExport = () => {
    const exportData: any[] = clientData.map(r => ({
      'PI Ref': r.piNo,
      'Vendor Name': r.vendorName || 'Direct',
      'Sales Amt': r.piAmount || 0,
      'Vendor Paid': r.vendorAmount || 0,
      'China Currency': r.chinaCurrency || 0,
      'Actual Amount': r.actualAmount || 0,
      'Note': r.note || ''
    }));

    exportData.push({
      'PI Ref': 'TOTAL',
      'Vendor Name': '',
      'Sales Amt': totalSales,
      'Vendor Paid': totalVendorPaid,
      'China Currency': '',
      'Actual Amount': clientData.reduce((sum, r) => sum + (r.actualAmount || 0), 0),
      'Note': ''
    });

    downloadCSV(exportData, `client_insights_${selectedClient}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0.5rem' }}>
      
      {/* ── Selection Header ── */}
      <div className="premium-card" style={{ 
        padding: '1.5rem', display: 'flex', flexWrap: 'wrap', 
        alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            width: 52, height: 52, borderRadius: '1.25rem', background: E.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: `0 8px 20px rgba(59, 130, 246, 0.3)`
          }}>
            <User size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Target Client</div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <select 
                value={selectedClient} 
                onChange={(e) => setSelectedClient(e.target.value)}
                style={{
                  appearance: 'none', background: 'transparent', border: 'none',
                  fontSize: '1.4rem', fontWeight: 800, color: E.text, cursor: 'pointer',
                  paddingRight: '1.75rem', outline: 'none', fontFamily: 'Outfit, sans-serif'
                }}
              >
                {clients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={20} style={{ position: 'absolute', right: 0, color: E.primary, pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Engagement</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: E.text }}>{formatCurrency(totalSales)}</div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {stats.map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card" 
            style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
          >
            <div style={{ 
              width: 44, height: 44, borderRadius: '1rem', background: `${s.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color
            }}>
              {React.cloneElement(s.icon as React.ReactElement, { size: 20 })}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: E.muted, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: E.text }}>
                {typeof s.val === 'number' ? formatCurrency(s.val) : s.val}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Table Area ── */}
      <div className="premium-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: `1px solid ${E.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={18} color={E.primary} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: E.text, fontFamily: 'Outfit, sans-serif' }}>Detailed Breakdown</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: E.primary, background: E.primaryLight, padding: '0.4rem 1rem', borderRadius: '2rem' }}>
              {clientData.length} Records
            </div>
            <button onClick={handleExport} className="btn-ghost" style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', 
              borderRadius: '0.8rem', fontSize: '0.75rem', fontWeight: 800, color: E.primary, border: `1.5px solid ${E.border}`,
              background: '#fff', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = E.primaryLight}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
        
        <div className="table-container no-scrollbar" style={{ overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '1.25rem', width: '80px' }}></th> 
                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>Vendor Name</th>
                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sales Amt</th>
                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Purchase Amt</th>
                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vendor Paid</th>
                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Partner Paid</th>
                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {clientData.map((row, i) => {
                  const isEditing = editingPiNo === row.piNo;
                  return (
                    <motion.tr 
                      key={row.piNo}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ 
                        borderBottom: `1px solid ${E.border}`, 
                        background: isEditing ? E.primaryLight : 'transparent',
                        transition: 'background 0.2s' 
                      }}
                      onMouseEnter={e => !isEditing && (e.currentTarget.style.background = E.primaryLight)}
                      onMouseLeave={e => !isEditing && (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button onClick={handleSave} style={{ width: 32, height: 32, background: E.success, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Save size={16} />
                            </button>
                            <button onClick={handleCancel} style={{ width: 32, height: 32, background: E.danger, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleStartEdit(row)} style={{ width: 32, height: 32, padding: 0, background: '#fff', color: E.primary, border: `1px solid ${E.border}`, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Edit3 size={14} />
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'left' }}>
                        <div style={{ fontWeight: 800, color: E.text, fontSize: '0.9rem' }}>{row.vendorName || 'Direct'}</div>
                        <div style={{ fontSize: '0.65rem', color: E.muted, marginTop: 3 }}>Ref: {row.piNo}</div>
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                        {isEditing ? (
                          <input type="number" value={editData?.piAmount || 0} onChange={(e) => updateField('piAmount', Number(e.target.value))} style={{ width: '100px', padding: '8px', borderRadius: '8px', border: `1px solid ${E.border}`, fontSize: '0.85rem', textAlign: 'center', background: '#fff' }} />
                        ) : (
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: E.text }}>{formatCurrency(row.piAmount)}</div>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                        {isEditing ? (
                          <input type="number" value={editData?.totalPurchaseAmount || 0} onChange={(e) => updateField('totalPurchaseAmount', Number(e.target.value))} style={{ width: '100px', padding: '8px', borderRadius: '8px', border: `1px solid ${E.border}`, fontSize: '0.85rem', textAlign: 'center', background: '#fff' }} />
                        ) : (
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: E.text }}>{formatCurrency(row.totalPurchaseAmount || 0)}</div>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, color: E.danger }}>
                        {formatCurrency(row.actualAmount || 0)}
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, color: E.success }}>
                        {formatCurrency(row.amount || 0)}
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center' }}>
                          <button onClick={() => onPayVendor(row)} style={{ padding: '0.5rem 1rem', background: E.danger, color: '#fff', border: 'none', borderRadius: '0.85rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Truck size={14} /> Vendor
                          </button>
                          <button onClick={() => onPayPartner(row)} style={{ padding: '0.5rem 1rem', background: E.success, color: '#fff', border: 'none', borderRadius: '0.85rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Wallet size={14} /> Partner
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
