// Dashboard.tsx — Premium Warm Brown & White Edition
import React, { useEffect, useRef, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart,
  RadialBar,
} from 'recharts';
import { motion, useInView, animate } from 'framer-motion';
import { FMSRow } from '../types';
import { formatCurrency } from '../utils';
import {
  TrendingUp, ArrowUpRight, Wallet, Users, Clock,
  ArrowUp, ArrowDown, Minus, MoreHorizontal, ChevronRight,
} from 'lucide-react';

/* ─────────────── DESIGN TOKENS ─────────────── */
const T = {
  brown950: '#120a05',
  brown900: '#2d1810',
  brown800: '#4a2c1a',
  brown750: '#5c3520',
  brown700: '#6b3f27',
  brown600: '#8b5435',
  brown500: '#a86b44',
  brown400: '#c4895f',
  brown300: '#d9a882',
  brown200: '#e8c9aa',
  brown150: '#edd8be',
  brown100: '#f3e2d0',
  brown75: '#f7ece0',
  brown50: '#faf4ee',
  cream: '#fdf8f3',
  white: '#ffffff',
  gold: '#c9974a',
  goldLight: '#e8c47a',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#d97706',
};

const FONT = { serif: "'Playfair Display', serif", sans: "'DM Sans', sans-serif" };

/* ─────────────── ANIMATED COUNTER ─────────────── */
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, value, {
      duration: 1.4,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent = prefix + v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
        }
      },
    });
    return () => ctrl.stop();
  }, [inView, value]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ─────────────── CUSTOM TOOLTIP ─────────────── */
const BrownTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.brown900, border: `1px solid ${T.brown700}`,
      borderRadius: '0.875rem', padding: '0.75rem 1rem',
      boxShadow: '0 12px 40px rgba(18,10,5,0.4)',
      fontFamily: FONT.sans, minWidth: 150,
    }}>
      {label && <p style={{ fontSize: '0.65rem', fontWeight: 700, color: T.brown300, marginBottom: '0.4rem', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginTop: i > 0 ? 2 : 0 }}>
          <span style={{ color: p.color || T.brown300 }}>● </span>
          {p.name}: <strong>{typeof p.value === 'number' && p.value > 1000 ? `₹${(p.value / 1000).toFixed(0)}k` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ─────────────── MAIN DASHBOARD ─────────────── */
interface DashboardProps { data: FMSRow[]; }

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const uniqueData = Object.values(
    data.reduce((acc: Record<string, FMSRow>, row) => {
      const key = (row.piNo || row.timestamp).toString().trim();
      if (!acc[key]) acc[key] = row;
      return acc;
    }, {})
  ) as FMSRow[];

  const totalPI = uniqueData.reduce((s, r) => s + (r.piAmount || 0), 0);
  const totalCollected = uniqueData.reduce((s, r) => s + (r.collectedAmount || 0), 0);
  const totalPartner = uniqueData.reduce((s, r) => s + (r.amount || 0), 0);
  const totalVendor = uniqueData.reduce((s, r) => s + (r.vendorAmount || 0), 0);
  const totalPending = totalPI - totalCollected;
  const collRate = totalPI > 0 ? (totalCollected / totalPI) * 100 : 0;
  const totalPayout = totalPartner; // Logic: Partner payout is the company's main expense; Partner pays vendor.
  const netBalance = totalCollected - totalPayout;

  /* Party bar data */
  const partyData = uniqueData.reduce((acc: any[], r) => {
    const ex = acc.find(x => x.name === r.partyName);
    if (ex) { ex.pi += r.piAmount || 0; ex.collected += r.collectedAmount || 0; }
    else acc.push({ name: r.partyName, pi: r.piAmount || 0, collected: r.collectedAmount || 0 });
    return acc;
  }, []).sort((a, b) => b.pi - a.pi).slice(0, 6);

  /* Trend area data (mock monthly from timestamps) */
  const monthMap: Record<string, { pi: number; collected: number }> = {};
  uniqueData.forEach(r => {
    const d = new Date(r.timestamp);
    if (isNaN(d.getTime())) return;
    const key = d.toLocaleString('default', { month: 'short' });
    if (!monthMap[key]) monthMap[key] = { pi: 0, collected: 0 };
    monthMap[key].pi += r.piAmount || 0;
    monthMap[key].collected += r.collectedAmount || 0;
  });
  const trendData = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));

  /* Donut data */
  const donutData = [
    { name: 'Collected', value: totalCollected, fill: T.brown700 },
    { name: 'Partner', value: totalPartner, fill: T.brown400 },
    { name: 'Vendor', value: totalVendor, fill: T.brown200 },
    { name: 'Pending', value: Math.max(totalPending, 0), fill: T.brown100 },
  ].filter(d => d.value > 0);

  /* Recent */
  const recent = [...uniqueData]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  /* KPIs */
  const kpis = [
    {
      label: 'Total Pi Amount', value: totalPI, icon: TrendingUp, raw: totalPI,
      sub: `${uniqueData.length} PIs`, badge: '+12%', badgeUp: true,
      gradient: `linear-gradient(135deg, ${T.brown900} 0%, ${T.brown700} 100%)`,
      textColor: '#fff', subColor: T.brown300,
    },
    {
      label: 'Total Collected Amount', value: totalCollected, icon: ArrowUpRight, raw: totalCollected,
      sub: `${collRate.toFixed(1)}% collected`, badge: `${collRate.toFixed(0)}%`, badgeUp: true,
      gradient: `linear-gradient(135deg, ${T.brown800} 0%, ${T.brown500} 100%)`,
      textColor: '#fff', subColor: T.brown300,
    },
    {
      label: 'Total Pending Amount', value: totalPending, icon: Wallet, raw: totalPending,
      sub: 'Outstanding dues', badge: 'Due', badgeUp: false,
      gradient: `#fff`,
      textColor: T.brown900, subColor: T.brown500,
      bordered: true,
    },
    {
      label: 'Partner Payouts', value: totalPartner, icon: Users, raw: totalPartner,
      sub: 'Paid to partners', badge: 'Payout', badgeUp: false,
      gradient: `#fff`,
      textColor: T.brown900, subColor: T.brown500,
      bordered: true,
    },
    {
      label: 'Vendor Payments', value: totalVendor, icon: Wallet, raw: totalVendor,
      sub: 'Paid to vendors', badge: 'Cost', badgeUp: false,
      gradient: `#fff`,
      textColor: T.brown900, subColor: T.brown500,
      bordered: true,
    },
    {
      label: 'Net Balance', value: netBalance, icon: TrendingUp, raw: netBalance,
      sub: 'Cash in Hand', badge: netBalance >= 0 ? 'Profit' : 'Loss', badgeUp: netBalance >= 0,
      gradient: netBalance >= 0 
        ? `linear-gradient(135deg, #16a34a 0%, #15803d 100%)`
        : `linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)`,
      textColor: '#fff', subColor: 'rgba(255,255,255,0.7)',
    },
  ];

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      variants={containerVariants} initial="hidden" animate="show"
      style={{
        fontFamily: FONT.sans,
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        paddingBottom: '3rem', maxWidth: 1440, margin: '0 auto',
      }}
    >

      {/* ══════════════ KPI STRIP ══════════════ */}
      <motion.div variants={itemVariants}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: '1rem' }}>
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={i}
              whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(45,24,16,0.18)' }}
              style={{
                background: k.gradient,
                border: k.bordered ? `1.5px solid ${T.brown150}` : 'none',
                borderRadius: '1.25rem',
                padding: '1.25rem 1.35rem',
                boxShadow: k.bordered
                  ? '0 2px 12px rgba(74,44,26,0.07)'
                  : '0 8px 28px rgba(45,24,16,0.22)',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                cursor: 'default',
              }}
            >
              {/* Decorative circle */}
              {!k.bordered && (
                <>
                  <div style={{
                    position: 'absolute', top: -30, right: -30, width: 100, height: 100,
                    background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none'
                  }} />
                  <div style={{
                    position: 'absolute', bottom: -20, left: -20, width: 70, height: 70,
                    background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none'
                  }} />
                </>
              )}
              {k.bordered && (
                <div style={{
                  position: 'absolute', top: -24, right: -24, width: 80, height: 80,
                  background: `${T.brown100}`, borderRadius: '50%', pointerEvents: 'none', opacity: 0.5
                }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', position: 'relative' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '0.65rem',
                  background: k.bordered ? T.brown100 : 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: k.bordered ? T.brown700 : '#fff',
                }}>
                  <Icon style={{ width: 17, height: 17 }} />
                </div>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em',
                  padding: '0.18rem 0.5rem', borderRadius: 99,
                  background: k.badgeUp
                    ? (k.bordered ? T.brown50 : 'rgba(255,255,255,0.15)')
                    : 'rgba(220,38,38,0.15)',
                  color: k.badgeUp
                    ? (k.bordered ? T.brown700 : '#fff')
                    : '#fca5a5',
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                  {k.badgeUp ? <ArrowUp style={{ width: 9, height: 9 }} /> : <ArrowDown style={{ width: 9, height: 9 }} />}
                  {k.badge}
                </span>
              </div>

              <p style={{
                fontSize: '0.62rem', fontWeight: 700, color: k.subColor,
                letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.25rem'
              }}>
                {k.label}
              </p>
              <h4 style={{
                fontFamily: FONT.serif, fontSize: '1.55rem', fontWeight: 700,
                color: k.textColor, letterSpacing: '-0.02em', lineHeight: 1.1
              }}>
                <AnimatedNumber value={k.raw} prefix="₹" />
              </h4>
              <p style={{ fontSize: '0.68rem', fontWeight: 500, color: k.subColor, marginTop: 4 }}>{k.sub}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ══════════════ MIDDLE ROW ══════════════ */}
      <motion.div variants={itemVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>

        {/* ── Bar Chart: Party Performance ── */}
        <div style={{
          background: T.white, border: `1.5px solid ${T.brown100}`,
          borderRadius: '1.5rem', overflow: 'hidden',
          boxShadow: '0 2px 20px rgba(74,44,26,0.07)',
        }}>
          <div style={{
            padding: '1.25rem 1.5rem 0.75rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            borderBottom: `1px solid ${T.brown75}`,
          }}>
            <div>
              <p style={{
                fontSize: '0.62rem', fontWeight: 700, color: T.brown400,
                letterSpacing: '0.1em', textTransform: 'uppercase'
              }}>Party Analytics</p>
              <h3 style={{
                fontFamily: FONT.serif, fontSize: '1.15rem', fontWeight: 700,
                color: T.brown900, letterSpacing: '-0.01em', marginTop: 2
              }}>
                PI vs Collection
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: 4 }}>
              {[{ label: 'PI Amount', color: T.brown800 }, { label: 'Collected', color: T.brown300 }].map(l => (
                <span key={l.label} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: '0.68rem', fontWeight: 600, color: T.brown600
                }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: 3,
                    background: l.color, display: 'inline-block'
                  }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ padding: '1rem 0.5rem 1.25rem', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partyData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.brown75} />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: T.brown500, fontSize: 10, fontWeight: 600, fontFamily: FONT.sans }}
                  dy={8} interval={0} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: T.brown300, fontSize: 10, fontFamily: FONT.sans }}
                  tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip content={<BrownTooltip />} cursor={{ fill: `${T.brown50}` }} />
                <Bar dataKey="pi" name="PI Amount" fill={T.brown800} radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="collected" name="Collected" fill={T.brown300} radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Donut + Stats ── */}
        <div style={{
          background: `linear-gradient(165deg, ${T.brown900} 0%, ${T.brown800} 60%, ${T.brown700} 100%)`,
          borderRadius: '1.5rem', padding: '1.25rem',
          boxShadow: '0 8px 32px rgba(18,10,5,0.3)',
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative rings */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            border: `1px solid rgba(201,151,74,0.12)`, borderRadius: '50%', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 140, height: 140,
            border: `1px solid rgba(201,151,74,0.08)`, borderRadius: '50%', pointerEvents: 'none'
          }} />

          <p style={{
            fontSize: '0.6rem', fontWeight: 700, color: T.brown400,
            letterSpacing: '0.1em', textTransform: 'uppercase'
          }}>Allocation</p>
          <h3 style={{
            fontFamily: FONT.serif, fontSize: '1.1rem', fontWeight: 700,
            color: '#fff', letterSpacing: '-0.01em', marginTop: 2, marginBottom: '0.5rem'
          }}>
            Fund Breakdown
          </h3>

          {/* Donut */}
          <div style={{ height: 190, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%"
                  innerRadius={62} outerRadius={82}
                  paddingAngle={4} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                  {donutData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={{
                  background: T.brown950, border: `1px solid ${T.brown700}`,
                  borderRadius: '0.6rem', fontFamily: FONT.sans, color: '#fff',
                }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
            }}>
              <span style={{
                fontFamily: FONT.serif, fontSize: '1.5rem',
                fontWeight: 700, color: '#fff', lineHeight: 1
              }}>
                {collRate.toFixed(0)}%
              </span>
              <span style={{
                fontSize: '0.6rem', fontWeight: 600, color: T.brown400,
                letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 2
              }}>
                Collected
              </span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[
              { label: 'Collected', value: totalCollected, color: T.brown700 },
              { label: 'Partner', value: totalPartner, color: T.brown400 },
              { label: 'Vendor', value: totalVendor, color: T.brown200 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: T.brown300 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ══════════════ AREA TREND + COLLECTION RATE ══════════════ */}
      {trendData.length > 0 && (
        <motion.div variants={itemVariants}
         style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>

          {/* Area Chart */}
          <div style={{
            background: T.white, border: `1.5px solid ${T.brown100}`,
            borderRadius: '1.5rem', overflow: 'hidden',
            boxShadow: '0 2px 20px rgba(74,44,26,0.07)',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem 0.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: `1px solid ${T.brown75}`
            }}>
              <div>
                <p style={{
                  fontSize: '0.62rem', fontWeight: 700, color: T.brown400,
                  letterSpacing: '0.1em', textTransform: 'uppercase'
                }}>Monthly Trend</p>
                <h3 style={{
                  fontFamily: FONT.serif, fontSize: '1.1rem', fontWeight: 700,
                  color: T.brown900, marginTop: 2
                }}>Cash Flow Overview</h3>
              </div>
            </div>
            <div style={{ padding: '0.75rem 0.5rem 1rem', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradPI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.brown800} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={T.brown800} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.brown400} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={T.brown400} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.brown75} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false}
                    tick={{ fill: T.brown400, fontSize: 10, fontFamily: FONT.sans }} dy={6} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fill: T.brown300, fontSize: 10, fontFamily: FONT.sans }}
                    tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip content={<BrownTooltip />} />
                  <Area type="monotone" dataKey="pi" name="PI Amount" stroke={T.brown800}
                    strokeWidth={2} fill="url(#gradPI)" dot={false} activeDot={{ r: 4, fill: T.brown800 }} />
                  <Area type="monotone" dataKey="collected" name="Collected" stroke={T.brown400}
                    strokeWidth={2} fill="url(#gradCol)" dot={false} activeDot={{ r: 4, fill: T.brown400 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Collection Rate radial */}
          <div style={{
            background: T.white, border: `1.5px solid ${T.brown100}`,
            borderRadius: '1.5rem', padding: '1.25rem',
            boxShadow: '0 2px 20px rgba(74,44,26,0.07)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <p style={{
              fontSize: '0.62rem', fontWeight: 700, color: T.brown400,
              letterSpacing: '0.1em', textTransform: 'uppercase', alignSelf: 'flex-start'
            }}>
              Efficiency
            </p>
            <h3 style={{
              fontFamily: FONT.serif, fontSize: '1.05rem', fontWeight: 700,
              color: T.brown900, marginTop: 2, alignSelf: 'flex-start'
            }}>
              Collection Rate
            </h3>

            <div style={{ width: '100%', height: 160, position: 'relative', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="100%" innerRadius="60%" outerRadius="90%"
                  startAngle={180} endAngle={0}
                  data={[{ value: collRate, fill: T.brown700 }, { value: 100 - collRate, fill: T.brown75 }]}>
                  <RadialBar dataKey="value" background={false} cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', bottom: 8, left: 0, right: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <span style={{
                  fontFamily: FONT.serif, fontSize: '2rem',
                  fontWeight: 700, color: T.brown900, lineHeight: 1
                }}>
                  <AnimatedNumber value={collRate} decimals={1} suffix="%" />
                </span>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 600, color: T.brown500,
                  letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 3
                }}>
                  Collected
                </span>
              </div>
            </div>

            {/* Mini stats */}
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
              {[
                { label: 'Total PIs', value: uniqueData.length.toString() },
                { label: 'Settled', value: uniqueData.filter(r => (r.collectedAmount || 0) >= (r.piAmount || 0)).length.toString() },
                { label: 'Pending PIs', value: uniqueData.filter(r => (r.collectedAmount || 0) < (r.piAmount || 0)).length.toString() },
                { label: 'Net Balance', value: `₹${(netBalance / 1000).toFixed(0)}k` },
              ].map(s => (
                <div key={s.label} style={{
                  background: T.brown50, borderRadius: '0.7rem',
                  padding: '0.5rem 0.6rem', border: `1px solid ${T.brown100}`
                }}>
                  <p style={{
                    fontSize: '0.58rem', fontWeight: 700, color: T.brown400,
                    letterSpacing: '0.08em', textTransform: 'uppercase'
                  }}>{s.label}</p>
                  <p style={{
                    fontFamily: FONT.serif, fontSize: '1rem', fontWeight: 700,
                    color: T.brown900, marginTop: 1
                  }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════ AUDIT LOG ══════════════ */}
      <motion.div variants={itemVariants} style={{
        background: T.white, border: `1.5px solid ${T.brown100}`,
        borderRadius: '1.5rem', overflow: 'hidden',
        boxShadow: '0 2px 20px rgba(74,44,26,0.07)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${T.brown75}`,
          background: T.brown50,
        }}>
          <div>
            <p style={{
              fontSize: '0.62rem', fontWeight: 700, color: T.brown400,
              letterSpacing: '0.1em', textTransform: 'uppercase'
            }}>Live Feed</p>
            <h3 style={{
              fontFamily: FONT.serif, fontSize: '1.1rem', fontWeight: 700,
              color: T.brown900, marginTop: 2
            }}>Recent Transactions</h3>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.45rem 0.9rem',
            background: `linear-gradient(135deg, ${T.brown800}, ${T.brown600})`,
            color: '#fff', border: 'none', borderRadius: '0.65rem',
            fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
            fontFamily: FONT.sans, boxShadow: `0 4px 14px rgba(74,44,26,0.28)`,
            letterSpacing: '0.04em',
          }}>
            View All <ChevronRight style={{ width: 13, height: 13 }} />
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT.sans }}>
            <thead>
              <tr style={{ background: T.cream }}>
                {[
                  { label: '#', align: 'center' },
                  { label: 'Reference', align: 'left' },
                  { label: 'Party', align: 'left' },
                  { label: 'PI Value', align: 'right' },
                  { label: 'Collected', align: 'right' },
                  { label: 'Outstanding', align: 'right' },
                  { label: 'Status', align: 'center' },
                  { label: 'Date', align: 'right' },
                ].map(h => (
                  <th key={h.label} style={{
                    padding: '0.7rem 1.1rem',
                    fontSize: '0.6rem', fontWeight: 700,
                    color: T.brown500, textAlign: h.align as any,
                    borderBottom: `1px solid ${T.brown100}`,
                    letterSpacing: '0.09em', textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((row, idx) => {
                const settled = (row.collectedAmount || 0) >= (row.piAmount || 0);
                const partial = (row.collectedAmount || 0) > 0 && !settled;
                const pending = (row.piAmount || 0) - (row.collectedAmount || 0);
                const statusCfg = settled
                  ? { label: 'Settled', bg: '#f0fdf4', color: T.success, border: '#bbf7d0' }
                  : partial
                    ? { label: 'Partial', bg: '#fffbeb', color: T.warning, border: '#fde68a' }
                    : { label: 'Pending', bg: T.brown50, color: T.brown600, border: T.brown200 };

                return (
                  <motion.tr key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + idx * 0.06 }}
                    style={{ borderBottom: `1px solid ${T.brown50}`, transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = T.brown50}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>

                    {/* # */}
                    <td style={{ padding: '0.9rem 1.1rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.brown300 }}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </td>

                    {/* Reference */}
                    <td style={{ padding: '0.9rem 1.1rem' }}>
                      <div style={{
                        fontFamily: FONT.serif, fontWeight: 600,
                        color: T.brown900, fontSize: '0.88rem', lineHeight: 1
                      }}>
                        {row.piNo}
                      </div>
                    </td>

                    {/* Party */}
                    <td style={{ padding: '0.9rem 1.1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '0.55rem', flexShrink: 0,
                          background: `linear-gradient(135deg, ${T.brown800}, ${T.brown500})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.75rem', color: '#fff',
                        }}>
                          {row.partyName?.[0]?.toUpperCase()}
                        </div>
                        <span style={{
                          fontSize: '0.8rem', fontWeight: 600, color: T.brown800,
                          whiteSpace: 'nowrap'
                        }}>
                          {row.partyName}
                        </span>
                      </div>
                    </td>

                    {/* PI Value */}
                    <td style={{
                      padding: '0.9rem 1.1rem', textAlign: 'right',
                      fontWeight: 700, color: T.brown900, fontSize: '0.82rem', fontFamily: FONT.sans
                    }}>
                      {formatCurrency(row.piAmount)}
                    </td>

                    {/* Collected */}
                    <td style={{
                      padding: '0.9rem 1.1rem', textAlign: 'right',
                      fontWeight: 700, color: T.success, fontSize: '0.82rem'
                    }}>
                      {formatCurrency(row.collectedAmount)}
                    </td>

                    {/* Outstanding */}
                    <td style={{
                      padding: '0.9rem 1.1rem', textAlign: 'right',
                      fontWeight: 700, fontSize: '0.82rem',
                      color: pending > 0 ? T.danger : T.brown300
                    }}>
                      {pending > 0 ? formatCurrency(pending) : '—'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.9rem 1.1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '0.2rem 0.6rem', borderRadius: 99,
                        fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em',
                        background: statusCfg.bg, color: statusCfg.color,
                        border: `1px solid ${statusCfg.border}`,
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: statusCfg.color, display: 'inline-block'
                        }} />
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{
                      padding: '0.9rem 1.1rem', textAlign: 'right',
                      fontSize: '0.72rem', color: T.brown400, fontWeight: 500,
                      whiteSpace: 'nowrap'
                    }}>
                      {row.timestamp}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {recent.length === 0 && (
            <div style={{ padding: '3.5rem', textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, background: T.brown50, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.85rem'
              }}>
                <Clock style={{ width: 20, height: 20, color: T.brown200 }} />
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: T.brown200 }}>
                No transactions yet
              </p>
            </div>
          )}
        </div>

        {/* Footer summary bar */}
        {recent.length > 0 && (
          <div style={{
            padding: '0.75rem 1.5rem',
            borderTop: `1px solid ${T.brown75}`,
            background: T.brown50,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 600, color: T.brown400 }}>
              Showing {recent.length} of {uniqueData.length} records
            </p>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              {[
                { label: 'Total PI', value: formatCurrency(totalPI), color: T.brown700 },
                { label: 'Collected', value: formatCurrency(totalCollected), color: T.success },
                { label: 'Outstanding', value: formatCurrency(totalPending), color: T.danger },
              ].map(s => (
                <span key={s.label} style={{ fontSize: '0.68rem', fontWeight: 600, color: T.brown500 }}>
                  {s.label}: <strong style={{ color: s.color, fontFamily: FONT.sans }}>{s.value}</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
};