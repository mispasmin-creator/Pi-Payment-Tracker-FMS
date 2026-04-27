// StepTable.tsx — Premium Earth-Light Theme
import React, { useState, useMemo } from 'react';
import { FMSRow, Step, STEPS } from '../types';
import { formatCurrency, cn } from '../utils';
import { Calendar, Edit3, Paperclip, CheckCircle2, X, ClipboardList, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimestamp } from '../api';

interface StepTableProps {
  data: FMSRow[];
  step: Step;
  onUpdate: (row: FMSRow) => void;
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

export const StepTable: React.FC<StepTableProps> = ({ data, step, onUpdate }) => {
  const [selectedGroup, setSelectedGroup] = useState<FMSRow[] | null>(null);
  const [approval, setApproval] = useState<'Approved' | 'Rejected' | 'Pending'>('Approved');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupedData = useMemo(() => {
    const groups: Record<string, FMSRow[]> = {};
    data.forEach(row => {
      const key = step === 'pi-approval'
        ? (row.partyName || 'Unknown').trim()
        : (row.piNo || '').replace(/\u200B/g, '').trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    return Object.values(groups);
  }, [data, step]);

  const handleBulkUpdate = async () => {
    if (!selectedGroup) return;
    setIsSubmitting(true);
    const now = formatTimestamp();
    try {
      for (const row of selectedGroup) {
        await onUpdate({ ...row, s2_actual: now, approval, note });
      }
      setSelectedGroup(null); setNote('');
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  /* ── badge helper ── */
  const ApprovalBadge = ({ val }: { val: string }) => {
    const cfg: Record<string, { bg: string; color: string; border: string }> = {
      Approved: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
      Rejected: { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
      Pending: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    };
    const c = cfg[val] || cfg['Pending'];
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '0.2rem 0.65rem', borderRadius: 99,
        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
        background: c.bg, color: c.color, border: `1px solid ${c.border}`
      }}>
        {val || 'Pending'}
      </span>
    );
  };

  /* ── Paperclip link ── */
  const PiLink = ({ url }: { url?: string }) => url ? (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{
        padding: '0.45rem', background: '#fff', border: `1px solid ${E.border}`,
        borderRadius: '0.75rem', color: E.primary, display: 'inline-flex', alignItems: 'center',
        transition: 'all 0.2s', textDecoration: 'none', boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = E.primary; a.style.color = '#fff'; }}
      onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = '#fff'; a.style.color = E.primary; }}>
      <Paperclip style={{ width: 14, height: 14 }} />
    </a>
  ) : <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>—</span>;

  /* ── Column definitions per step ── */
  const getColumns = () => {
    switch (step) {
      case 'pi-received': return [
        { header: 'Timestamp', render: (rows: FMSRow[]) => <span style={{ fontSize: '0.75rem', color: E.muted }}>{rows[0].timestamp}</span> },
        { header: 'PI No.', render: (rows: FMSRow[]) => <span style={{ fontWeight: 800, color: E.text, fontSize: '0.85rem' }}>{rows[0].piNo}</span> },
        { header: 'Client Name', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: E.text, fontSize: '0.85rem' }}>{rows[0].partyName}</span> },
        { header: 'Total Sales Amount', render: (rows: FMSRow[]) => <span style={{ fontWeight: 800, color: E.primary, fontSize: '0.88rem' }}>{formatCurrency(rows[0].piAmount)}</span> },
        { header: 'PI Copy', render: (rows: FMSRow[]) => <PiLink url={rows[0].piCopy} /> },
        { header: 'Vendor Name', render: (rows: FMSRow[]) => <span style={{ fontWeight: 600, color: E.text, fontSize: '0.85rem' }}>{rows[0].vendorName || '—'}</span> },
        { header: 'Total Purchase Amount', render: (rows: FMSRow[]) => <span style={{ fontWeight: 800, color: rows[0].totalPurchaseAmount ? E.success : E.muted, fontSize: '0.88rem' }}>{rows[0].totalPurchaseAmount ? formatCurrency(rows[0].totalPurchaseAmount) : '—'}</span> },
      ];
      case 'vendor-payment': return [
        { header: 'PI Details', render: (rows: FMSRow[]) => (
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, color: E.text, fontSize: '0.88rem' }}>{rows[0].piNo}</div>
            <div style={{ fontSize: '0.65rem', color: E.muted, marginTop: 3 }}>{rows[0].timestamp}</div>
          </div>
        )},
        { header: 'Party', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: E.text, fontSize: '0.88rem' }}>{rows[0].partyName}</span> },
        { header: 'Collected', render: (rows: FMSRow[]) => <span style={{ fontWeight: 800, color: E.success, fontSize: '0.9rem' }}>{formatCurrency(rows[0].collectedAmount)}</span> },
        { header: 'Partner Payout', render: (rows: FMSRow[]) => <span style={{ fontWeight: 800, color: E.primary, fontSize: '0.9rem' }}>{formatCurrency(rows[0].amount)}</span> },
      ];
      default: return [];
    }
  };

  const columns = getColumns();

  return (
    <>
      <div className="premium-card" style={{
        overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '78vh',
      }}>
        <div className="table-container no-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
              <tr style={{ background: '#fafafa' }}>
                {columns.map((c, i) => (
                  <th key={i} style={{
                    padding: '1rem 1.5rem', fontSize: '0.72rem',
                    fontWeight: 800, color: E.muted, textAlign: i === 0 ? 'left' : 'center',
                    borderBottom: `1px solid ${E.border}`, letterSpacing: '0.08em',
                    textTransform: 'uppercase', whiteSpace: 'nowrap'
                  }}>
                    {c.header}
                  </th>
                ))}
                <th style={{
                  padding: '1rem 1.5rem', fontSize: '0.72rem', fontWeight: 800,
                  color: E.muted, textAlign: 'right', borderBottom: `1px solid ${E.border}`,
                  letterSpacing: '0.08em', textTransform: 'uppercase'
                }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {groupedData.map((rows, i) => (
                  <motion.tr 
                    key={rows[0].piNo + i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ transition: 'all 0.2s', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = E.primaryLight}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {columns.map((c, ci) => (
                      <td key={ci} style={{ padding: '1.25rem 1.5rem', textAlign: ci === 0 ? 'left' : 'center' }}>
                        {c.render(rows)}
                      </td>
                    ))}
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => onUpdate(rows[0])}
                        style={{
                          padding: '0.5rem 1rem', background: '#fff', border: `1px solid ${E.border}`,
                          borderRadius: '0.85rem', color: E.primary, fontSize: '0.75rem', fontWeight: 800,
                          cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = E.primary; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = E.primary; }}
                      >
                        <Edit3 size={14} /> Update
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {groupedData.length === 0 && (
            <div style={{ padding: '5rem', textAlign: 'center', color: E.muted }}>
              <TrendingUp size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No pending tasks in this step.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Approval Modal Placeholder */}
      <AnimatePresence>
        {selectedGroup && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.3)', backdropFilter: 'blur(10px)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card" style={{ width: '100%', maxWidth: 450, padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: E.text }}>Bulk Update</h3>
                  <p style={{ fontSize: '0.8rem', color: E.muted, marginTop: 4 }}>Processing {selectedGroup.length} records for {selectedGroup[0].partyName}</p>
                </div>
                <button onClick={() => setSelectedGroup(null)} style={{ border: 'none', background: 'none', color: E.muted, cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['Approved', 'Rejected'].map(v => (
                  <button key={v} onClick={() => setApproval(v as any)}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: '1rem', border: `1.5px solid ${approval === v ? E.primary : E.border}`,
                      background: approval === v ? E.primary : 'transparent', color: approval === v ? '#fff' : E.muted,
                      fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    {v}
                  </button>
                ))}
              </div>

              <textarea placeholder="Add internal note..." value={note} onChange={e => setNote(e.target.value)}
                style={{
                  width: '100%', height: 100, padding: '1rem', borderRadius: '1.25rem', border: `1px solid ${E.border}`,
                  outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem', marginBottom: '2rem', boxSizing: 'border-box'
                }} />

              <button onClick={handleBulkUpdate} disabled={isSubmitting}
                style={{
                  width: '100%', padding: '1.1rem', background: E.primary, color: '#fff', border: 'none',
                  borderRadius: '1.25rem', fontWeight: 800, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: '0 8px 20px rgba(59,130,246,0.3)'
                }}>
                {isSubmitting ? 'Processing...' : 'Confirm & Save'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};