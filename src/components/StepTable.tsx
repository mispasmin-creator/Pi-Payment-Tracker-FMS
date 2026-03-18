// StepTable.tsx — Warm Brown & White Theme
import React, { useState, useMemo } from 'react';
import { FMSRow, Step, STEPS } from '../types';
import { formatCurrency, cn } from '../utils';
import { Calendar, Edit3, Paperclip, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimestamp } from '../api';

interface StepTableProps {
  data: FMSRow[];
  step: Step;
  onUpdate: (row: FMSRow) => void;
}

const B = {
  900: '#2d1810', 800: '#4a2c1a', 700: '#6b3f27', 600: '#8b5435',
  500: '#a86b44', 400: '#c4895f', 300: '#d9a882', 200: '#e8c9aa',
  100: '#f3e2d0', 50: '#faf4ee',
};

export const StepTable: React.FC<StepTableProps> = ({ data, step, onUpdate }) => {
  const [selectedGroup, setSelectedGroup] = useState<FMSRow[] | null>(null);
  const [approval, setApproval] = useState<'Approved' | 'Rejected' | 'Pending'>('Approved');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupedData = useMemo(() => {
    const groups: Record<string, FMSRow[]> = {};
    data.forEach(row => {
      const key = (row.piNo || '').replace(/\u200B/g, '').trim();
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
        padding: '0.18rem 0.55rem', borderRadius: 99,
        fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em',
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
        padding: '0.35rem', background: B[50], border: `1px solid ${B[200]}`,
        borderRadius: '0.45rem', color: B[700], display: 'inline-flex', alignItems: 'center',
        transition: 'all 0.18s', textDecoration: 'none'
      }}
      onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = B[800]; a.style.color = '#fff'; }}
      onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = B[50]; a.style.color = B[700]; }}>
      <Paperclip style={{ width: 13, height: 13 }} />
    </a>
  ) : <span style={{ color: B[200], fontSize: '0.72rem' }}>—</span>;

  /* ── Column definitions per step ── */
  const getColumns = () => {
    switch (step) {
      case 'pi-received': return [
        {
          header: 'PI Details', render: (rows: FMSRow[]) => (
            <div>
              <div style={{ fontWeight: 700, color: B[900], fontSize: '0.82rem' }}>{rows[0].piNo}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: 4 }}>
                {rows.map((r, i) => (
                  <span key={i} style={{
                    fontSize: '0.62rem', background: B[50],
                    color: B[700], padding: '0.12rem 0.45rem', borderRadius: 99,
                    border: `1px solid ${B[200]}`
                  }}>
                    {r.itemName} ({r.qty})
                  </span>
                ))}
              </div>
            </div>
          )
        },
        { header: 'Amount', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: B[900], fontSize: '0.82rem' }}>{formatCurrency(rows[0].piAmount)}</span> },
        { header: 'PI Copy', render: (rows: FMSRow[]) => <PiLink url={rows[0].piCopy} /> },
      ];
      case 'pi-approval': return [
        { header: 'PI Number', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: B[900], fontSize: '0.82rem' }}>{rows[0].piNo}</span> },
        { header: 'Party', render: (rows: FMSRow[]) => <span style={{ fontWeight: 500, color: B[700], fontSize: '0.82rem' }}>{rows[0].partyName}</span> },
        { header: 'PI Amount', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: B[900], fontSize: '0.82rem' }}>{formatCurrency(rows[0].piAmount)}</span> },
        {
          header: 'Items', render: (rows: FMSRow[]) => (
            <div style={{ maxWidth: 140 }}>
              {rows.map((r, i) => <div key={i} style={{ fontSize: '0.68rem', color: B[600], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.itemName} ({r.qty})</div>)}
            </div>
          )
        },
        { header: 'Remark', render: (rows: FMSRow[]) => <span style={{ fontSize: '0.72rem', color: B[500], fontStyle: 'italic' }}>{rows[0].remark || '—'}</span> },
        {
          header: 'Planned', render: (rows: FMSRow[]) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: B[600], fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              <Calendar style={{ width: 12, height: 12 }} />{rows[0].s2_planned || '—'}
            </div>
          )
        },
        { header: 'PI Copy', render: (rows: FMSRow[]) => <PiLink url={rows[0].piCopy} /> },
      ];
      case 'payment-received': return [
        { header: 'Timestamp', render: (rows: FMSRow[]) => <span style={{ color: B[400], fontSize: '0.75rem' }}>{rows[0].timestamp}</span> },
        { header: 'PI No.', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: B[900], fontSize: '0.82rem' }}>{rows[0].piNo}</span> },
        { header: 'Party', render: (rows: FMSRow[]) => <span style={{ fontWeight: 500, color: B[700], fontSize: '0.82rem' }}>{rows[0].partyName}</span> },
        { header: 'PI Amount', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: B[900], fontSize: '0.82rem' }}>{formatCurrency(rows[0].piAmount)}</span> },
        {
          header: 'Items', render: (rows: FMSRow[]) => (
            <div style={{ maxWidth: 130 }}>
              {rows.map((r, i) => <div key={i} style={{ fontSize: '0.68rem', color: B[600], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.itemName} ({r.qty})</div>)}
            </div>
          )
        },
        {
          header: 'Approval', render: (rows: FMSRow[]) => (
            <div>
              <ApprovalBadge val={rows[0].approval} />
              {rows[0].note && <div style={{ fontSize: '0.62rem', color: B[400], marginTop: 2, fontStyle: 'italic', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rows[0].note}</div>}
            </div>
          )
        },
        { header: 'Collected', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.82rem' }}>{formatCurrency(rows[0].collectedAmount)}</span> },
        {
          header: 'Pending', render: (rows: FMSRow[]) => {
            const p = (rows[0].piAmount || 0) - (rows[0].collectedAmount || 0);
            return <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.82rem' }}>{formatCurrency(p)}</span>;
          }
        },
        { header: 'PI Copy', render: (rows: FMSRow[]) => <PiLink url={rows[0].piCopy} /> },
      ];
      case 'partner-payout': return [
        { header: 'PI No', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: B[900], fontSize: '0.82rem' }}>{rows[0].piNo}</span> },
        { header: 'Party', render: (rows: FMSRow[]) => <span style={{ fontWeight: 500, color: B[700], fontSize: '0.82rem' }}>{rows[0].partyName}</span> },
        { header: 'PI Amount', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: B[900], fontSize: '0.82rem' }}>{formatCurrency(rows[0].piAmount)}</span> },
        { header: 'Collected', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.82rem' }}>{formatCurrency(rows[0].collectedAmount)}</span> },
        { header: 'Partner Payout', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.82rem' }}>{formatCurrency(rows[0].amount)}</span> },
      ];
      case 'vendor-payment': return [
        { header: 'Timestamp', render: (rows: FMSRow[]) => <span style={{ color: B[400], fontSize: '0.75rem' }}>{rows[0].timestamp}</span> },
        { header: 'PI No', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: B[900], fontSize: '0.82rem' }}>{rows[0].piNo}</span> },
        { header: 'Party', render: (rows: FMSRow[]) => <span style={{ fontWeight: 500, color: B[700], fontSize: '0.82rem' }}>{rows[0].partyName}</span> },
        { header: 'Collected', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.82rem' }}>{formatCurrency(rows[0].collectedAmount)}</span> },
        { header: 'Partner Payout', render: (rows: FMSRow[]) => <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.82rem' }}>{formatCurrency(rows[0].amount)}</span> },
        { header: 'Planned', render: (rows: FMSRow[]) => <span style={{ color: B[400], fontSize: '0.75rem', fontStyle: 'italic' }}>{rows[0].s5_planned || '—'}</span> },
      ];
      default: return [];
    }
  };

  const columns = getColumns();

  return (
    <>
      <div style={{
        background: '#fff', border: `1px solid ${B[100]}`, borderRadius: '1.5rem',
        overflow: 'hidden', boxShadow: '0 2px 16px rgba(74,44,26,0.07)',
        display: 'flex', flexDirection: 'column', height: '75vh',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }} className="no-scrollbar">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
              <tr style={{ background: B[50] }}>
                {columns.map((c, i) => (
                  <th key={i} style={{
                    padding: '0.65rem 1.1rem', fontSize: '0.62rem',
                    fontWeight: 700, color: B[600], textAlign: 'left',
                    borderBottom: `1px solid ${B[200]}`, letterSpacing: '0.08em',
                    textTransform: 'uppercase', whiteSpace: 'nowrap'
                  }}>
                    {c.header}
                  </th>
                ))}
                <th style={{
                  padding: '0.65rem 1.1rem', fontSize: '0.62rem', fontWeight: 700,
                  color: B[600], textAlign: 'right', borderBottom: `1px solid ${B[200]}`,
                  letterSpacing: '0.08em', textTransform: 'uppercase'
                }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((group, idx) => (
                <motion.tr key={idx}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{ borderBottom: `1px solid ${B[50]}`, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = B[50]}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                  {columns.map((col, i) => (
                    <td key={i} style={{ padding: '0.85rem 1.1rem' }}>{col.render(group)}</td>
                  ))}
                  <td style={{ padding: '0.85rem 1.1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => step === 'pi-approval' ? setSelectedGroup(group) : onUpdate(group[0])}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.5rem 0.9rem',
                        background: `linear-gradient(135deg, ${B[800]}, ${B[600]})`,
                        color: '#fff', border: 'none', borderRadius: '0.7rem',
                        fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                        boxShadow: `0 4px 12px rgba(74,44,26,0.22)`,
                        transition: 'filter 0.18s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}>
                      <Edit3 style={{ width: 12, height: 12 }} /> Process
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {groupedData.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '4rem', textAlign: 'center'
            }}>
              <div style={{
                width: 56, height: 56, background: B[50], borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem'
              }}>
                <CheckCircle2 style={{ width: 22, height: 22, color: B[200] }} />
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: B[300] }}>All tasks completed</p>
            </div>
          )}
        </div>
      </div>

      {/* ── PI Approval Modal ── */}
      <AnimatePresence>
        {selectedGroup && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(26,15,8,0.45)',
            backdropFilter: 'blur(10px)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              style={{
                background: '#fff', borderRadius: '1.5rem', padding: '1.5rem',
                width: '100%', maxWidth: 400,
                border: `1px solid ${B[100]}`,
                boxShadow: '0 24px 64px rgba(74,44,26,0.2)',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: '1.25rem'
              }}>
                <div>
                  <h3 style={{
                    fontFamily: 'Playfair Display, serif', fontSize: '1.1rem',
                    fontWeight: 700, color: B[900]
                  }}>PI Approval</h3>
                  <p style={{ fontSize: '0.72rem', color: B[500], marginTop: 3 }}>
                    Update status for <strong style={{ color: B[800] }}>{selectedGroup[0].piNo}</strong>
                  </p>
                </div>
                <button onClick={() => setSelectedGroup(null)}
                  style={{
                    padding: '0.35rem', background: B[50], border: `1px solid ${B[200]}`,
                    borderRadius: '0.5rem', cursor: 'pointer', color: B[500], display: 'flex', alignItems: 'center'
                  }}>
                  <X style={{ width: 15, height: 15 }} />
                </button>
              </div>

              {/* Status buttons */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '0.62rem', fontWeight: 700, color: B[500],
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem'
                }}>
                  Approval Status
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                  {(['Approved', 'Rejected', 'Pending'] as const).map(s => (
                    <button key={s} onClick={() => setApproval(s)}
                      style={{
                        padding: '0.6rem', borderRadius: '0.7rem',
                        fontSize: '0.72rem', fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                        transition: 'all 0.18s',
                        background: approval === s
                          ? `linear-gradient(135deg, ${B[800]}, ${B[600]})`
                          : '#fff',
                        color: approval === s ? '#fff' : B[600],
                        border: `1.5px solid ${approval === s ? B[800] : B[200]}`,
                        boxShadow: approval === s ? `0 4px 12px rgba(74,44,26,0.22)` : 'none',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div style={{ marginBottom: '1.1rem' }}>
                <p style={{
                  fontSize: '0.62rem', fontWeight: 700, color: B[500],
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem'
                }}>
                  Note
                </p>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Add a note…"
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem',
                    background: B[50], border: `1.5px solid ${B[200]}`,
                    borderRadius: '0.7rem', fontSize: '0.8rem', fontWeight: 500, color: B[900],
                    fontFamily: 'DM Sans, sans-serif', resize: 'none', height: 80,
                    boxSizing: 'border-box', transition: 'border-color 0.18s',
                  }}
                  onFocus={e => { e.target.style.borderColor = B[600]; }}
                  onBlur={e => { e.target.style.borderColor = B[200]; }} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setSelectedGroup(null)}
                  style={{
                    flex: 1, padding: '0.75rem', background: B[50],
                    border: `1px solid ${B[200]}`, borderRadius: '0.875rem',
                    fontSize: '0.78rem', fontWeight: 600, color: B[700],
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.18s'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = B[100]; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = B[50]; }}>
                  Cancel
                </button>
                <button onClick={handleBulkUpdate} disabled={isSubmitting}
                  style={{
                    flex: 2, padding: '0.75rem', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.4rem',
                    background: `linear-gradient(135deg, ${B[800]}, ${B[600]})`,
                    color: '#fff', border: 'none', borderRadius: '0.875rem',
                    fontSize: '0.78rem', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontFamily: 'DM Sans, sans-serif', opacity: isSubmitting ? 0.7 : 1,
                    boxShadow: `0 6px 18px rgba(74,44,26,0.28)`, transition: 'filter 0.18s'
                  }}
                  onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}>
                  {isSubmitting
                    ? <div style={{
                      width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    : 'Update Status'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </>
  );
};