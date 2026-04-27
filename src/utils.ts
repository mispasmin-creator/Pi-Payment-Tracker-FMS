import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
export function downloadCSV(data: any[], filename: string) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => {
    let val = r[h];
    if (val === null || val === undefined) val = '';
    const strVal = String(val).replace(/"/g, '""');
    return `"${strVal}"`;
  }).join(','));
  const csv = headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
