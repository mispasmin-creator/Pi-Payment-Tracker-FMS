// PaymentInstallmentView.tsx
import React from 'react';
import { FMSRow } from '../types';
import { formatCurrency } from '../utils';
import { ClipboardList, User, Truck, IndianRupee } from 'lucide-react';

interface Props {
  data: FMSRow[];
  type: 'partner' | 'vendor';
}

const B = {
  900: '#2d1810', 800: '#4a2c1a', 700: '#6b3f27', 600: '#8b5435',
  500: '#a86b44', 400: '#c4895f', 300: '#d9a882', 200: '#e8c9aa',
  100: '#f3e2d0', 50: '#faf4ee',
};

export const PaymentInstallmentView: React.FC<Props> = ({ data, type }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem' }}>
      <div style={{ 
        background: '#fff', borderRadius: '1.5rem', border: `1px solid ${B[100]}`, 
        overflow: 'hidden', boxShadow: '0 2px 16px rgba(74,44,26,0.07)' 
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: B[50], borderBottom: `1px solid ${B[100]}` }}>
                <th style={{ padding: '0.85rem', fontSize: '0.6rem', fontWeight: 800, color: B[600], textTransform: 'uppercase' }}>PI No.</th>
                <th style={{ padding: '0.85rem', fontSize: '0.6rem', fontWeight: 800, color: B[600], textTransform: 'uppercase' }}>{type === 'partner' ? 'Client' : 'Vendor'} Name</th>
                <th style={{ padding: '0.85rem', fontSize: '0.6rem', fontWeight: 800, color: B[600], textTransform: 'uppercase' }}>Total PI Amount</th>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <th key={n} style={{ padding: '0.85rem', fontSize: '0.6rem', fontWeight: 800, color: B[600], textTransform: 'uppercase' }}>Pay{n}</th>
                ))}
                <th style={{ padding: '0.85rem', fontSize: '0.6rem', fontWeight: 800, color: B[600], textTransform: 'uppercase' }}>Total Paid</th>
                <th style={{ padding: '0.85rem', fontSize: '0.6rem', fontWeight: 800, color: B[600], textTransform: 'uppercase' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const pays = type === 'partner' 
                  ? [row.pay1, row.pay2, row.pay3, row.pay4, row.pay5, row.pay6, row.pay7, row.pay8, row.pay9, row.pay10]
                  : [row.vendorPay1, row.vendorPay2, row.vendorPay3, row.vendorPay4, row.vendorPay5, row.vendorPay6, row.vendorPay7, row.vendorPay8, row.vendorPay9, row.vendorPay10];
                
                const totalPaid = pays.reduce((s, p) => s + (Number(p) || 0), 0);
                const balance = (row.piAmount || 0) - totalPaid;

                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${B[50]}`, fontSize: '0.75rem' }}>
                    <td style={{ padding: '0.85rem', fontWeight: 700, color: B[900] }}>{row.piNo}</td>
                    <td style={{ padding: '0.85rem', fontWeight: 600, color: B[700] }}>
                      {type === 'partner' ? row.partyName : row.vendorName}
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 700, color: B[800] }}>{formatCurrency(row.piAmount)}</td>
                    {pays.map((p, idx) => (
                      <td key={idx} style={{ padding: '0.85rem', color: p ? '#16a34a' : B[300], fontWeight: p ? 700 : 400 }}>
                        {p ? formatCurrency(p) : '—'}
                      </td>
                    ))}
                    <td style={{ padding: '0.85rem', fontWeight: 800, color: '#16a34a' }}>{formatCurrency(totalPaid)}</td>
                    <td style={{ padding: '0.85rem', fontWeight: 800, color: balance > 0 ? '#dc2626' : '#16a34a' }}>
                      {formatCurrency(balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
