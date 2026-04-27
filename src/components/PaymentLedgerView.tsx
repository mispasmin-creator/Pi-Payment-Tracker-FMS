// PaymentLedgerView.tsx — Premium Earth-Light Theme
import React from 'react';
import { PaymentRecord, FMSRow } from '../types';
import { formatCurrency, downloadCSV } from '../utils';
import { 
  IndianRupee, Calendar, Hash, User, 
  FileText, Download, Filter, Search
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  subtitle: string;
  data: PaymentRecord[];
  allRecords: FMSRow[];
  type: 'vendor' | 'partner';
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

export const PaymentLedgerView: React.FC<Props> = ({ title, subtitle, data, allRecords, type }) => {
  const [search, setSearch] = React.useState('');
  
  const getClientName = (piNo: string) => {
    const record = allRecords.find(r => r.piNo === piNo);
    return record?.partyName || 'Unknown';
  };

  const filtered = data.filter(r => {
    const clientName = getClientName(r.piNo);
    return r.piNo.toLowerCase().includes(search.toLowerCase()) ||
           r.name.toLowerCase().includes(search.toLowerCase()) ||
           clientName.toLowerCase().includes(search.toLowerCase()) ||
           (r.note || '').toLowerCase().includes(search.toLowerCase());
  }).reverse(); // Newest first

  const total = filtered.reduce((sum, r) => sum + r.amount, 0);

  const handleExport = () => {
    const exportData = filtered.map(r => ({
      'PI Ref': r.piNo,
      'Payment Date': r.date,
      'Client Name': getClientName(r.piNo),
      [type === 'vendor' ? 'Vendor Name' : 'Agent Name']: r.name,
      'Amount': r.amount,
      'Note': r.note || ''
    }));
    downloadCSV(exportData, `${type}_ledger_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem' }}>
      
      {/* ── Header Card ── */}
      <div className="premium-card" style={{ 
        padding: '1.5rem', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: E.text, fontFamily: 'Outfit, sans-serif' }}>{title}</h2>
          <p style={{ fontSize: '0.85rem', color: E.muted, fontWeight: 500, marginTop: 4 }}>{subtitle}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Disbursed</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: E.primary }}>
            {formatCurrency(total)}
          </div>
        </div>
      </div>

      {/* ── Search & Export ── */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: E.primary }} size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '1rem',
              border: `1.5px solid ${E.border}`, background: '#fff', fontSize: '0.88rem',
              outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', color: E.text,
              transition: 'all 0.2s', boxSizing: 'border-box'
            }}
            onFocus={e => { e.target.style.borderColor = E.primary; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = E.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <button onClick={handleExport} style={{
          padding: '0.75rem 1.25rem', background: '#fff', border: `1.5px solid ${E.border}`,
          borderRadius: '1rem', color: E.primary, fontSize: '0.8rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = E.primaryLight; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
          <Download size={16} /> Export View
        </button>
      </div>

      {/* ── Table Area ── */}
      <div className="premium-card" style={{ overflow: 'hidden' }}>
        <div className="table-container no-scrollbar" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PI Ref</th>
                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {type === 'vendor' ? 'Vendor Name' : 'Agent Name'}
                </th>
                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                {type === 'vendor' && (
                  <>
                    <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>China Currency</th>
                    <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actual Amount</th>
                  </>
                )}
                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ borderBottom: `1px solid ${E.border}`, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = E.primaryLight}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '0.6rem', background: '#fafafa', color: E.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Hash size={14} />
                      </div>
                      <span style={{ fontWeight: 800, color: E.text, fontSize: '0.85rem' }}>{row.piNo}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, color: E.text, fontSize: '0.85rem' }}>{row.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: E.muted, fontSize: '0.65rem', marginTop: 4 }}>
                      <Calendar size={12} />
                      {row.date ? row.date.split(',')[0] : 'No Date'}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ 
                      fontSize: '0.95rem', fontWeight: 900, 
                      color: E.primary 
                    }}>
                      {formatCurrency(row.amount)}
                    </div>
                  </td>
                  {type === 'vendor' && (
                    <>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: E.warning }}>
                          {row.chinaCurrency ? Number(row.chinaCurrency).toLocaleString('en-IN') : '0'}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: E.success }}>
                          {formatCurrency(row.actualAmount || 0)}
                        </div>
                      </td>
                    </>
                  )}
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', color: E.muted, maxWidth: '200px', margin: '0 auto', fontStyle: 'italic' }}>
                      {row.note || '—'}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={type === 'vendor' ? 6 : 5} style={{ padding: '5rem', textAlign: 'center', color: E.muted }}>
                    <FileText size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 600 }}>No payment records found matching your search.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
