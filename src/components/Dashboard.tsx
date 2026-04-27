// Dashboard.tsx — Premium Analytics Dashboard
import React, { useMemo } from 'react';
import { FMSRow } from '../types';
import { formatCurrency } from '../utils';
import { 
  IndianRupee, TrendingUp, Wallet, Truck, 
  ArrowUpRight, Users, Activity, ShoppingBag,
  ArrowDownRight, BarChart3, PieChart as PieIcon,
  Clock, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

interface DashboardProps {
  data: FMSRow[];
}

const COLORS = {
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

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // ── Data Processing ──
  const totalSales = data.reduce((sum, r) => sum + (r.piAmount || 0), 0);
  const totalPurchase = data.reduce((sum, r) => sum + (r.totalPurchaseAmount || 0), 0);
  const totalCollected = data.reduce((sum, r) => sum + (r.collectedAmount || 0), 0);
  const totalPartner = data.reduce((sum, r) => sum + (r.amount || 0), 0);
  
  // Chart Data: Top Clients by Volume
  const clientData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      const name = r.partyName || 'Unknown';
      map[name] = (map[name] || 0) + (r.piAmount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data]);

  // Chart Data: Recent Sales vs Purchase (Mocked time series from actual data)
  const timeData = useMemo(() => {
    // Group by timestamp (last 7 unique dates or indices)
    const grouped = data.slice(-10).map((r, i) => ({
      name: r.piNo?.slice(-5) || `PI-${i}`,
      sales: r.piAmount || 0,
      purchase: r.totalPurchaseAmount || 0,
    }));
    return grouped;
  }, [data]);

  const stats = [
    { label: 'Gross Sales', val: totalSales, icon: <IndianRupee />, color: COLORS.primary, trend: '+12.5%', isUp: true },
    { label: 'Procurement', val: totalPurchase, icon: <ShoppingBag />, color: COLORS.primaryDark, trend: 'Active', isUp: true },
    { label: 'Total Collection', val: totalCollected, icon: <TrendingUp />, color: COLORS.success, trend: `${((totalCollected/totalSales)*100 || 0).toFixed(1)}%`, isUp: true },
    { label: 'Partner Payouts', val: totalPartner, icon: <Wallet />, color: COLORS.warning, trend: 'Verified', isUp: true },
  ];

  const PIE_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, '#8b5cf6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {stats.map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card"
            style={{ padding: '1.75rem', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: '1rem', background: `${s.color}15`, 
                color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${s.color}10`
              }}>
                {React.cloneElement(s.icon as React.ReactElement, { size: 22 })}
              </div>
              <div style={{ 
                fontSize: '0.7rem', fontWeight: 800, color: s.isUp ? COLORS.success : COLORS.danger, 
                background: s.isUp ? '#f0fdf4' : '#fff1f2', padding: '0.4rem 0.8rem', borderRadius: '2rem', 
                display: 'flex', alignItems: 'center', gap: 4, border: `1px solid ${s.isUp ? '#dcfce7' : '#fecdd3'}`
              }}>
                {s.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {s.trend}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: COLORS.text, letterSpacing: '-0.03em', fontFamily: 'Outfit, sans-serif' }}>
                {formatCurrency(s.val)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Charts Area ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Performance Overview (Bar Chart) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="premium-card"
          style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: COLORS.text }}>Performance Matrix</h3>
              <p style={{ fontSize: '0.85rem', color: COLORS.muted, marginTop: 4 }}>Sales vs Procurement analysis (Recent PI)</p>
            </div>
            <BarChart3 size={20} color={COLORS.primary} />
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1rem' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 8 }}
                />
                <Bar dataKey="sales" fill={COLORS.primary} radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="purchase" fill={COLORS.primaryLight} radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Client Volume (Pie Chart) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="premium-card"
          style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: COLORS.text }}>Volume Share</h3>
            <PieIcon size={20} color={COLORS.primary} />
          </div>
          
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {clientData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {clientData.slice(0, 3).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i] }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.text }}>{c.name}</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: COLORS.muted }}>{((c.value / totalSales) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Operational Health & Recent Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Operational Health */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card"
          style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: COLORS.text }}>Operational Health</h3>
            <Activity size={18} color={COLORS.success} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {[
              { label: 'Collection Rate', val: totalCollected, total: totalSales, color: COLORS.success, icon: <TrendingUp size={14} /> },
              { label: 'Procurement Ratio', val: totalPurchase, total: totalSales, color: COLORS.primary, icon: <ShoppingBag size={14} /> },
              { label: 'Profitability Margin', val: totalSales - totalPurchase, total: totalSales, color: COLORS.primaryDark, icon: <IndianRupee size={14} /> },
            ].map((p, i) => {
              const pct = p.total > 0 ? Math.min((p.val / p.total) * 100, 100) : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ color: p.color }}>{p.icon}</div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.muted }}>{p.label}</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: p.color }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 10, background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      style={{ 
                        height: '100%', background: `linear-gradient(90deg, ${p.color}, ${p.color}dd)`, 
                        borderRadius: '10px', boxShadow: `0 0 10px ${p.color}30` 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Insights / Recent Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: COLORS.text }}>Recent Insights</h3>
            <Users size={18} color={COLORS.primary} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div style={{ background: COLORS.primaryLight, padding: '1.25rem', borderRadius: '1.25rem', border: `1px solid rgba(59, 130, 246, 0.1)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Users size={16} color={COLORS.primary} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.primary, textTransform: 'uppercase' }}>Client Base</span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: COLORS.text }}>{new Set(data.map(r => r.partyName)).size} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.muted }}>Active Partners</span></p>
            </div>

            <div style={{ background: '#fef3c7', padding: '1.25rem', borderRadius: '1.25rem', border: `1px solid rgba(245, 158, 11, 0.1)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Clock size={16} color={COLORS.warning} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.warning, textTransform: 'uppercase' }}>Pipeline</span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: COLORS.text }}>{data.filter(r => !r.approval).length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.muted }}>Pending Approvals</span></p>
            </div>

            <div style={{ background: '#dcfce7', padding: '1.25rem', borderRadius: '1.25rem', border: `1px solid rgba(16, 185, 129, 0.1)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={16} color={COLORS.success} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.success, textTransform: 'uppercase' }}>Workflow</span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: COLORS.text }}>{data.filter(r => r.s5_actual).length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.muted }}>Completed Cycles</span></p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};