// DataTable.tsx — Warm Brown & White Theme
import React from 'react';
import { FMSRow, Step, STEPS } from '../types';
import { formatCurrency, cn } from '../utils';
import { Search, Filter, MoreVertical, Paperclip } from 'lucide-react';

interface DataTableProps {
  data: FMSRow[];
  onEdit: (row: FMSRow, step?: Step) => void;
  onOpenSelector: (row: FMSRow) => void;
}

const B = {
  900: '#0f172a', 800: '#1e293b', 700: '#334155', 600: '#475569',
  500: '#64748b', 400: '#94a3b8', 300: '#cbd5e1', 200: '#e2e8f0',
  100: '#f1f5f9', 50: '#f8fafc',
  primary: '#3b82f6', primaryDark: '#2563eb', primaryLight: '#eff6ff'
};

export const DataTable: React.FC<DataTableProps> = ({ data, onEdit, onOpenSelector }) => {
  const uniqueRows = Object.values(
    data.reduce((acc: Record<string, FMSRow>, row) => {
      const key = row.piNo || row.timestamp;
      if (!acc[key]) acc[key] = row;
      return acc;
    }, {} as Record<string, FMSRow>)
  ) as FMSRow[];

  const headers = [
    { label: 'Reference', align: 'left' },
    { label: 'Client Name', align: 'left' },
    { label: 'PI Amount', align: 'right' },
    { label: 'Collected', align: 'right' },
    { label: 'Outstanding', align: 'right' },
    { label: 'Partner', align: 'right' },
    { label: 'Vendor', align: 'right' },
    { label: 'PI Copy', align: 'center' },
    { label: 'Manage', align: 'center' },
  ];

  return (
    <div style={{
      background: '#fff', border: `1px solid ${B[200]}`,
      borderRadius: '1.5rem', overflow: 'hidden',
      boxShadow: 'var(--shadow-premium)',
      display: 'flex', flexDirection: 'column', height: '75vh',
    }}>
      {/* ── Table Head Bar ── */}
      <div style={{
        padding: '1rem 1.5rem', borderBottom: `1px solid ${B[100]}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: B[50], flexShrink: 0,
      }}>
        <div>
          <h3 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800,
            color: B[900], letterSpacing: '-0.01em'
          }}>Financial Ledger</h3>
          <p style={{ fontSize: '0.75rem', color: B[500], marginTop: 2, fontWeight: 500 }}>
            Full transaction history and audit trail
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.5rem 1rem', background: '#fff',
          border: `1px solid ${B[200]}`, borderRadius: '0.75rem',
          fontSize: '0.75rem', fontWeight: 700, color: B[600],
          cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = B.primary; b.style.color = '#fff'; b.style.borderColor = B.primary; }}
          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#fff'; b.style.color = B[600]; b.style.borderColor = B[200]; }}>
          <Filter style={{ width: 14, height: 14 }} /> Filter
        </button>
      </div>

      {/* ── Table ── */}
      <div className="table-container no-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Sans, sans-serif', minWidth: '1000px' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
            <tr style={{ background: B[50] }}>
              {headers.map(h => (
                <th key={h.label} style={{
                  padding: '0.65rem 1.1rem',
                  fontSize: '0.62rem', fontWeight: 700, color: B[600],
                  textAlign: h.align as any,
                  borderBottom: `1px solid ${B[200]}`,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uniqueRows.map((row, idx) => {
              const pending = (row.piAmount || 0) - (row.collectedAmount || 0);
              return (
                <tr key={idx}
                  style={{ borderBottom: `1px solid ${B[50]}`, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = B[50]}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>

                  {/* Reference */}
                  <td style={{ padding: '0.85rem 1.1rem', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: B[900], fontSize: '0.82rem', lineHeight: 1 }}>{row.piNo}</div>
                    <div style={{ fontSize: '0.65rem', color: B[400], marginTop: 3, fontWeight: 500 }}>{row.timestamp}</div>
                  </td>

                  {/* Party */}
                  <td style={{ padding: '0.85rem 1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '0.55rem',
                        background: B[100], display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: B[700],
                        flexShrink: 0,
                      }}>{row.partyName?.[0]}</div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: B[800], whiteSpace: 'nowrap' }}>
                        {row.partyName}
                      </span>
                    </div>
                  </td>

                  {/* PI Value */}
                  <td style={{
                    padding: '0.85rem 1.1rem', textAlign: 'center',
                    fontWeight: 700, color: B[900], fontSize: '0.82rem'
                  }}>
                    {formatCurrency(row.piAmount)}
                  </td>

                  {/* Collected */}
                  <td style={{
                    padding: '0.85rem 1.1rem', textAlign: 'center',
                    fontWeight: 700, color: '#16a34a', fontSize: '0.82rem'
                  }}>
                    {formatCurrency(row.collectedAmount)}
                  </td>

                  {/* Outstanding */}
                  <td style={{
                    padding: '0.85rem 1.1rem', textAlign: 'center',
                    fontWeight: 700, color: '#ef4444', fontSize: '0.82rem',
                    background: 'rgba(239, 68, 68, 0.02)'
                  }}>
                    {formatCurrency(pending)}
                  </td>

                  {/* Partner */}
                  <td style={{
                    padding: '0.85rem 1.1rem', textAlign: 'center',
                    fontWeight: 700, color: B.primary, fontSize: '0.82rem'
                  }}>
                    {formatCurrency(row.amount)}
                  </td>

                  {/* Vendor */}
                  <td style={{
                    padding: '0.85rem 1.1rem', textAlign: 'center',
                    fontWeight: 700, color: B[600], fontSize: '0.82rem'
                  }}>
                    {formatCurrency(row.vendorAmount)}
                  </td>

                  {/* PI Copy */}
                  <td style={{ padding: '0.85rem 1.1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {row.piCopy ? (
                        <a href={row.piCopy} target="_blank" rel="noopener noreferrer"
                          style={{
                            padding: '0.4rem', background: B[50],
                            border: `1px solid ${B[200]}`, borderRadius: '0.55rem',
                            color: B[700], display: 'flex', alignItems: 'center',
                            transition: 'all 0.18s',
                          }}
                          onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = B[800]; a.style.color = '#fff'; }}
                          onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = B[50]; a.style.color = B[700]; }}>
                          <Paperclip style={{ width: 14, height: 14 }} />
                        </a>
                      ) : <span style={{ color: B[200], fontSize: '0.75rem' }}>—</span>}
                    </div>
                  </td>

                  {/* Manage */}
                  <td style={{ padding: '0.85rem 1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => onOpenSelector(row)}
                        style={{
                          padding: '0.4rem 0.5rem', background: '#fff',
                          border: `1.5px solid ${B[200]}`, borderRadius: '0.55rem',
                          color: B[500], cursor: 'pointer', display: 'flex', alignItems: 'center',
                          transition: 'all 0.18s',
                        }}
                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = B[600]; b.style.color = B[800]; b.style.background = B[50]; }}
                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = B[200]; b.style.color = B[500]; b.style.background = '#fff'; }}>
                        <MoreVertical style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {uniqueRows.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '4rem', textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, background: B[50], borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
            }}>
              <Search style={{ width: 22, height: 22, color: B[300] }} />
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: B[300] }}>No records found</p>
          </div>
        )}
      </div>
    </div>
  );
};