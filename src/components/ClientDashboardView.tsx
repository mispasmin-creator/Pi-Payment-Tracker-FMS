// ClientDashboardView.tsx — Premium Earth-Light Theme
import React from 'react';
import { FMSRow } from '../types';
import { formatCurrency, downloadCSV } from '../utils';
import { CheckCircle2, IndianRupee, Clock, Package, Download } from 'lucide-react';

interface Props {
  data: FMSRow[];
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

interface ClientGroup {
  name: string;
  totalPi: number;
  totalPurchase: number;
  paidPartner: number;
  paidVendor: number;
  count: number;
}

export const ClientDashboardView: React.FC<Props> = ({ data }) => {
  const groups = data.reduce((acc, row) => {
    const key = (row.partyName || 'Unknown').trim();
    if (!acc[key]) acc[key] = { name: key, totalPi: 0, totalPurchase: 0, paidPartner: 0, paidVendor: 0, count: 0 };
    acc[key].totalPi += (row.piAmount || 0);
    acc[key].totalPurchase += (row.totalPurchaseAmount || 0);
    acc[key].paidPartner += (row.amount || 0);
    acc[key].paidVendor += (row.vendorAmount || 0);
    acc[key].count++;
    return acc;
  }, {} as Record<string, ClientGroup>);

  const summary = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));

  const stats = [
    { label: 'Total Sales Vol', val: summary.reduce((s, c) => s + c.totalPi, 0), icon: <IndianRupee />, color: E.primary },
    { label: 'Total Purchase Vol', val: summary.reduce((s, c) => s + c.totalPurchase, 0), icon: <Package />, color: E.primaryDark },
    { label: 'Total Paid Partner', val: summary.reduce((s, c) => s + c.paidPartner, 0), icon: <CheckCircle2 />, color: E.success },
    { label: 'Collection Balance', val: summary.reduce((s, c) => s + (c.totalPi - c.paidPartner), 0), icon: <Clock />, color: E.warning },
  ];

  const handleExport = () => {
    const exportData = summary.map(c => ({
      'Client Name': c.name,
      'Sales Amt': c.totalPi,
      'Purchase Amt': c.totalPurchase,
      'Paid Partner': c.paidPartner,
      'Balance': c.totalPi - c.paidPartner
    }));
    downloadCSV(exportData, `client_dashboard_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem' }}>
      
      {/* Export Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.5rem' }}>
        <button onClick={handleExport} className="btn-ghost" style={{ 
          display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', 
          borderRadius: '0.8rem', fontSize: '0.8rem', fontWeight: 800, color: E.primary, 
          background: '#fff', border: `1.5px solid ${E.border}`, cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = E.primaryLight; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
          <Download size={16} /> Export Summary CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {stats.map((s, i) => (
          <div key={i} className="premium-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '0.8rem', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement(s.icon as React.ReactElement, { size: 18 })}
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: E.text }}>{formatCurrency(s.val)}</div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="premium-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', paddingLeft: '2rem' }}>Client Name</th>
              <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sales Amt</th>
              <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purchase Amt</th>
              <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid Partner</th>
              <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: E.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((c, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${E.border}`, transition: 'background 0.18s' }}
                onMouseEnter={e => e.currentTarget.style.background = E.primaryLight}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1.25rem', fontSize: '0.88rem', fontWeight: 800, color: E.text, textAlign: 'left', paddingLeft: '2rem' }}>{c.name}</td>
                <td style={{ padding: '1.25rem', fontSize: '0.88rem', fontWeight: 800, color: E.primary }}>{formatCurrency(c.totalPi)}</td>
                <td style={{ padding: '1.25rem', fontSize: '0.88rem', fontWeight: 800, color: E.primaryDark }}>{formatCurrency(c.totalPurchase)}</td>
                <td style={{ padding: '1.25rem', fontSize: '0.88rem', fontWeight: 800, color: E.success }}>{formatCurrency(c.paidPartner)}</td>
                <td style={{ padding: '1.25rem', fontSize: '0.88rem', fontWeight: 900, color: E.warning, background: 'rgba(245, 158, 11, 0.02)' }}>
                  {formatCurrency(c.totalPi - c.paidPartner)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
