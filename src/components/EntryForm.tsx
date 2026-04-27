// EntryForm.tsx — Premium Earth-Light Theme
import React, { useState, useEffect, useMemo } from 'react';
import { FMSRow, Step, STEPS, FMSItem, MasterData } from '../types';
import { cn } from '../utils';
import { formatTimestamp, uploadFile } from '../api';
import {
  Save, X, User, Hash, FileText, CheckCircle2, IndianRupee, Truck,
  ClipboardList, Clock, Plus, PlusCircle, Trash2, RefreshCw, Paperclip, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EntryFormProps {
  onSave: (row: Partial<FMSRow>, step: Step, stayOpen?: boolean) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<FMSRow>;
  initialStep?: Step;
  allData?: FMSRow[];
  isInline?: boolean;
  masterData?: MasterData;
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

const B = {
  900: '#0f172a', 800: '#1e293b', 700: '#334155', 600: '#475569',
  500: '#64748b', 400: '#94a3b8', 300: '#cbd5e1', 200: '#e2e8f0',
  100: '#f1f5f9', 50: '#f8fafc',
};

/* ── Shared Input ── */
const Field = ({ label, icon, ...props }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
    {label && (
      <label style={{
        fontSize: '0.72rem', fontWeight: 800,
        color: E.muted, letterSpacing: '0.04em', textTransform: 'uppercase'
      }}>
        {label}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: E.primary, display: 'flex', alignItems: 'center', pointerEvents: 'none'
        }}>
          {icon}
        </span>
      )}
      <input {...props}
        style={{
          width: '100%', padding: icon ? '0.85rem 1rem 0.85rem 2.75rem' : '0.85rem 1rem',
          background: props.disabled ? '#f9f9f9' : '#fff',
          border: `1.5px solid ${E.border}`, borderRadius: '1.1rem',
          fontSize: '0.88rem', fontWeight: 500, color: props.disabled ? E.muted : E.text,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box',
          cursor: props.disabled ? 'not-allowed' : 'text',
          ...props.style,
        }}
        onFocus={e => { if (!props.disabled) { e.target.style.borderColor = E.primary; e.target.style.boxShadow = `0 0 0 4px rgba(59, 130, 246, 0.1)`; } }}
        onBlur={e => { e.target.style.borderColor = E.border; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  </div>
);

/* ── Section label ── */
const SectionTitle = ({ icon, label, color = E.primary }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
    <div style={{
      width: 38, height: 38, borderRadius: '0.9rem', background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0
    }}>
      {icon}
    </div>
    <span style={{
      fontSize: '0.85rem', fontWeight: 800, color: E.text,
      letterSpacing: '0.02em', textTransform: 'uppercase'
    }}>{label}</span>
  </div>
);

/* ── Card wrapper ── */
const FieldGroup = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: '#fff', border: `1px solid ${E.border}`,
    borderRadius: '1.5rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
    boxShadow: 'var(--shadow-premium)'
  }}>
    {children}
  </div>
);

const Row2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
    {children}
  </div>
);

/* ── Premium Searchable Select ── */
const SearchableSelect = ({ label, value, onChange, options, icon, placeholder }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter((opt: string) => 
      opt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', position: 'relative' }}>
      {label && (
        <label style={{
          fontSize: '0.72rem', fontWeight: 800,
          color: E.muted, letterSpacing: '0.04em', textTransform: 'uppercase'
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: E.primary, display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 5
          }}>
            {icon}
          </span>
        )}
        <input
          value={isOpen ? searchTerm : (value || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            // If the user clears the input, clear the value
            if (e.target.value === '') onChange({ target: { value: '' } });
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          placeholder={placeholder || `Select ${label}...`}
          style={{
            width: '100%', padding: icon ? '0.85rem 1rem 0.85rem 2.75rem' : '0.85rem 1rem',
            background: '#fff',
            border: `1.5px solid ${isOpen ? E.primary : E.border}`, borderRadius: '1.1rem',
            fontSize: '0.88rem', fontWeight: 600, color: E.text,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box',
            boxShadow: isOpen ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
          }}
        />
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: E.muted, pointerEvents: 'none' }}>
          <RefreshCw style={{ width: 12, height: 12, opacity: 0.5 }} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#fff', border: `1px solid ${E.border}`,
              borderRadius: '1.25rem', boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
              zIndex: 100, maxHeight: 220, overflowY: 'auto', padding: '0.5rem'
            }}
            className="no-scrollbar"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt: string, i: number) => (
                <div
                  key={i}
                  onClick={() => {
                    onChange({ target: { value: opt } });
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '0.75rem 1rem', borderRadius: '0.85rem',
                    fontSize: '0.85rem', fontWeight: 600, color: E.text,
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = E.primaryLight; (e.currentTarget as HTMLDivElement).style.color = E.primary; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = E.text; }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: E.muted }}>
                No results found. Type to add new.
                <div 
                  onClick={() => {
                    onChange({ target: { value: searchTerm } });
                    setIsOpen(false);
                  }}
                  style={{ marginTop: '0.5rem', color: E.primary, fontWeight: 700, cursor: 'pointer' }}
                >
                  Add "{searchTerm}"
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── File Upload area ── */
const PiCopyUpload = ({ piCopy, uploading, onUpload, onClear }: any) => (
  <div style={{ background: `${B[50]}`, border: `1.5px solid ${B[200]}`, borderRadius: '0.875rem', padding: '0.85rem' }}>
    <p style={{
      fontSize: '0.62rem', fontWeight: 800, color: B[500],
      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem'
    }}>
      Attach PI Document
    </p>
    {piCopy ? (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', border: `1px solid ${B[100]}`, borderRadius: '0.65rem', padding: '0.65rem 0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 28, height: 28, background: E.primaryLight, borderRadius: '0.45rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: E.primary
          }}>
            <Paperclip style={{ width: 13, height: 13 }} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: B[900], lineHeight: 1 }}>Document Linked</p>
            <p style={{ fontSize: '0.65rem', color: B[400], marginTop: 2 }}>Ready to save</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <a href={piCopy} target="_blank" rel="noopener noreferrer"
            style={{
              padding: '0.35rem', background: B[50], border: `1px solid ${B[200]}`,
              borderRadius: '0.45rem', color: E.primary, display: 'flex', alignItems: 'center',
              transition: 'all 0.18s', textDecoration: 'none'
            }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = E.primary; a.style.color = '#fff'; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = B[50]; a.style.color = E.primary; }}>
            <ExternalLink style={{ width: 13, height: 13 }} />
          </a>
          <button onClick={onClear}
            style={{
              padding: '0.35rem', background: '#fff', border: '1px solid #fecdd3',
              borderRadius: '0.45rem', color: '#e11d48', display: 'flex', alignItems: 'center', cursor: 'pointer',
              transition: 'all 0.18s'
            }}>
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    ) : (
      <div style={{ position: 'relative' }}>
        <input type="file" onChange={onUpload} accept=".pdf,.jpg,.jpeg,.png"
          disabled={uploading}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: '#fff', border: `1.5px dashed ${B[300]}`,
          borderRadius: '0.65rem', transition: 'all 0.18s',
        }}>
          {uploading ? (
            <>
              <RefreshCw style={{ width: 16, height: 16, color: E.primary, animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: E.primary }}>Uploading to Drive…</span>
            </>
          ) : (
            <>
              <div style={{
                width: 28, height: 28, background: E.primaryLight, borderRadius: '0.45rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: E.primary
              }}>
                <Paperclip style={{ width: 13, height: 13 }} />
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: B[800], lineHeight: 1 }}>Upload PDF / Image</p>
                <p style={{ fontSize: '0.65rem', color: B[400], marginTop: 2 }}>Secure cloud storage</p>
              </div>
            </>
          )}
        </div>
      </div>
    )}
  </div>
);

/* ── Save button ── */
const SaveBtn = ({ flex = 1, label, onClick, submitting }: { flex?: number; label: string; onClick: () => void; submitting: boolean }) => (
  <button onClick={onClick} disabled={submitting}
    style={{
      flex, padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      background: `linear-gradient(135deg, ${E.primary}, ${E.primaryDark})`, color: '#fff',
      border: 'none', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 800,
      cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
      opacity: submitting ? 0.7 : 1, boxShadow: `0 8px 20px rgba(59, 130, 246, 0.3)`,
      letterSpacing: '0.02em', transition: 'all 0.2s',
    }}
    onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}>
    {submitting
      ? <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
      : <Save style={{ width: 16, height: 16 }} />}
    {submitting ? 'Saving…' : label}
  </button>
);

/* ══════════════════════════════════════════════════════ */
export const EntryForm: React.FC<EntryFormProps> = ({
  onSave, onClose, initialData, initialStep, allData = [], isInline, masterData,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(initialStep || 'pi-received');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const generatePiNo = () => {
    if (initialData?.piNo) return initialData.piNo;
    const last = allData.map(d => parseInt(d.piNo.replace(/PI-/i, ''))).filter(n => !isNaN(n)).sort((a, b) => b - a)[0] || 0;
    return `PI-${String(last + 1).padStart(4, '0')}`;
  };

  const [formData, setFormData] = useState<Partial<FMSRow>>(initialData || {
    timestamp: formatTimestamp(), piNo: '', partyName: '', piAmount: undefined,
    items: [{ name: '', qty: 0 }], remark: '', approval: '', note: '',
    collectedAmount: undefined, amount: undefined, vendorName: '', vendorAmount: undefined, piCopy: '',
  });

  useEffect(() => {
    if (!initialData) {
      const next = generatePiNo();
      if (next !== formData.piNo) setFormData(p => ({ ...p, piNo: next }));
    }
    // Clear amount fields when starting a new partial record so previous sums don't pre-fill
    if (initialData) {
      if (initialStep === 'payment-received') setFormData(p => ({ ...p, collectedAmount: 0 }));
      if (initialStep === 'partner-payout') setFormData(p => ({ ...p, amount: 0 }));
      if (initialStep === 'vendor-payment') setFormData(p => ({ ...p, vendorAmount: 0 }));
    }
  }, [allData, initialData, initialStep]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { url, error } = await uploadFile(file);
    if (url) setFormData(p => ({ ...p, piCopy: url }));
    else alert(`Upload failed: ${error || 'Unknown error'}`);
    setUploading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(p => {
      const next = { ...p, [name]: type === 'number' ? Number(value) : value };
      
      // Auto-calculate Actual Amount
      if (name === 'vendorAmount' || name === 'chinaCurrency') {
        const amt = name === 'vendorAmount' ? Number(value) : (p.vendorAmount || 0);
        const cur = name === 'chinaCurrency' ? Number(value) : (p.chinaCurrency || 0);
        if (amt && cur) {
          next.actualAmount = Number((amt / cur).toFixed(2));
        } else {
          next.actualAmount = 0;
        }
      }
      
      return next;
    });
  };

  const handleItemChange = (idx: number, field: keyof FMSItem, val: string | number) => {
    const items = [...(formData.items || [])];
    items[idx] = { ...items[idx], [field]: field === 'qty' ? Number(val) : val };
    setFormData(p => ({ ...p, items }));
  };

  const addItem = () => setFormData(p => ({ ...p, items: [...(p.items || []), { name: '', qty: 0 }] }));
  const removeItem = (idx: number) => {
    const items = (formData.items || []).filter((_, i) => i !== idx);
    setFormData(p => ({ ...p, items: items.length ? items : [{ name: '', qty: 0 }] }));
  };

  const [batch, setBatch] = useState<Partial<FMSRow>[]>([]);

  useEffect(() => {
    if (!initialData && currentStep === 'pi-received') {
      const next = generatePiNo();
      setBatch([{ 
        piNo: next, partyName: '', piAmount: undefined, 
        vendorName: '', totalPurchaseAmount: undefined, 
        piCopy: '', timestamp: formatTimestamp() 
      }]);
    }
  }, [allData, initialData, currentStep]);

  const addBatchRow = () => {
    setBatch(prev => {
      const last = prev[prev.length - 1];
      const lastPi = last?.piNo || generatePiNo();
      const num = parseInt(lastPi.replace('PI-', '')) + 1;
      const nextPi = `PI-${String(num).padStart(4, '0')}`;
      return [...prev, { 
        piNo: nextPi, 
        partyName: last?.partyName || '', 
        piAmount: undefined, 
        vendorName: '', 
        totalPurchaseAmount: undefined, 
        piCopy: '', 
        timestamp: formatTimestamp() 
      }];
    });
  };

  const updateBatchRow = (idx: number, field: keyof FMSRow, val: any) => {
    setBatch(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val === '' ? undefined : val };
      return next;
    });
  };

  const removeBatchRow = (idx: number) => {
    if (batch.length > 1) setBatch(prev => prev.filter((_, i) => i !== idx));
  };

  const handleBatchUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { url, error } = await uploadFile(file);
    if (url) updateBatchRow(idx, 'piCopy', url);
    else alert(`Upload failed: ${error}`);
    setUploading(false);
  };

  const handleSave = async (stayOpen = false) => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const now = formatTimestamp();
      
      if (!initialData && currentStep === 'pi-received') {
        // Save all in batch
        for (const entry of batch) {
          if (!entry.partyName || !entry.piAmount) continue;
          await onSave({ ...entry, s1_actual: now }, currentStep, true);
        }
        if (!stayOpen) onClose();
        else {
           // Reset batch
           const next = generatePiNo();
           setBatch([{ piNo: next, partyName: '', piAmount: undefined, vendorName: '', totalPurchaseAmount: undefined, piCopy: '', timestamp: now }]);
           setSubmitting(false);
        }
        return;
      }

      const save = { ...formData };
      if (currentStep === 'pi-received') { save.s1_actual = now; }
      if (currentStep === 'pi-approval') { save.s2_actual = now; }
      if (currentStep === 'payment-received') { save.s3_actual = now; }
      if (currentStep === 'partner-payout') { save.s4_actual = now; save.s5_planned = now; }
      if (currentStep === 'vendor-payment') { save.s5_actual = now; }
      
      await onSave(save, currentStep, stayOpen);
      
      if (stayOpen) {
        setFormData({
          timestamp: formatTimestamp(),
          piNo: generatePiNo(),
          partyName: '',
          piAmount: undefined,
          vendorName: '',
          totalPurchaseAmount: undefined,
          piCopy: '',
          note: '',
          chinaCurrency: undefined,
          actualAmount: undefined,
          vendorAmount: undefined
        });
        setSubmitting(false);
      }
    } catch { setSubmitting(false); }
  };

  /* ── Step-specific form fields ── */
  const renderFields = () => {
    switch (currentStep) {
      case 'pi-received': 
        if (!initialData) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionTitle icon={<ClipboardList style={{ width: 14, height: 14 }} />} label="Batch PI Entry" />
                <button onClick={addBatchRow} style={{
                   padding: '0.5rem 1rem', background: E.primary, color: '#fff', border: 'none', 
                   borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                   display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                }}>
                  <Plus size={14} /> Add Another PI
                </button>
              </div>
              
              {batch.map((item, idx) => (
                <div key={idx} className="premium-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${E.primary}`, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: E.primary, letterSpacing: '0.1em' }}>PI RECORD #{idx + 1} — {item.piNo}</span>
                    {batch.length > 1 && (
                      <button onClick={() => removeBatchRow(idx)} style={{ background: 'none', border: 'none', color: E.danger, cursor: 'pointer', padding: 4 }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Row2>
                      <SearchableSelect label="Client Name" value={item.partyName} onChange={(e:any) => updateBatchRow(idx, 'partyName', e.target.value)} options={masterData?.parties || []} icon={<User style={{ width: 14, height: 14 }} />} />
                      <Field label="Sales Amount" type="number" value={item.piAmount ?? ''} onChange={(e:any) => updateBatchRow(idx, 'piAmount', e.target.value === '' ? undefined : Number(e.target.value))} />
                    </Row2>
                    <Row2>
                      <SearchableSelect label="Vendor Name" value={item.vendorName} onChange={(e:any) => updateBatchRow(idx, 'vendorName', e.target.value)} options={masterData?.items || []} icon={<Truck style={{ width: 14, height: 14 }} />} />
                      <Field label="Purchase Amount" type="number" value={item.totalPurchaseAmount ?? ''} onChange={(e:any) => updateBatchRow(idx, 'totalPurchaseAmount', e.target.value === '' ? undefined : Number(e.target.value))} />
                    </Row2>
                    <PiCopyUpload 
                      piCopy={item.piCopy} 
                      uploading={uploading} 
                      onUpload={(e:any) => handleBatchUpload(idx, e)}
                      onClear={() => updateBatchRow(idx, 'piCopy', '')} 
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return (
          <>
            <SectionTitle icon={<ClipboardList style={{ width: 14, height: 14 }} />} label="PI Received Details" />
            <FieldGroup>
              <div style={{ display: 'none' }}>
                <Field label="Timestamp" name="timestamp" value={formData.timestamp} onChange={handleChange} />
                <Field label="PI No." name="piNo" value={formData.piNo} onChange={handleChange} />
              </div>
              <Row2>
                <SearchableSelect label="Client Name" name="partyName" value={formData.partyName} onChange={handleChange} options={masterData?.parties || []} icon={<User style={{ width: 14, height: 14 }} />} />
                <Field label="Total Sales Amount" name="piAmount" value={formData.piAmount ?? ''} onChange={handleChange} type="number" icon={<IndianRupee style={{ width: 14, height: 14 }} />} />
              </Row2>
              <Row2>
                <SearchableSelect label="Vendor Name" name="vendorName" value={formData.vendorName} onChange={handleChange} options={masterData?.items || []} icon={<Truck style={{ width: 14, height: 14 }} />} />
                <Field label="Total Purchase Amount" name="totalPurchaseAmount" value={formData.totalPurchaseAmount ?? ''} onChange={handleChange} type="number" icon={<Clock style={{ width: 14, height: 14 }} />} />
              </Row2>
              <PiCopyUpload piCopy={formData.piCopy} uploading={uploading} onUpload={handleFileUpload}
                onClear={() => setFormData(p => ({ ...p, piCopy: '' }))} />
            </FieldGroup>
          </>
        );

      case 'pi-approval': return (
        <>
          <SectionTitle icon={<CheckCircle2 style={{ width: 14, height: 14 }} />} label="PI Approval" color={E.success} />
          <FieldGroup>
            <div>
              <label style={{
                display: 'block', fontSize: '0.65rem', fontWeight: 700,
                color: B[500], letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.35rem'
              }}>
                Approval Status
              </label>
              <select name="approval" value={formData.approval} onChange={handleChange}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem',
                  background: '#fff', border: `1.5px solid ${B[200]}`, borderRadius: '0.7rem',
                  fontSize: '0.82rem', fontWeight: 500, color: B[900],
                  fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                  appearance: 'auto',
                }}>
                <option value="">Select Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <Field label="Note" name="note" value={formData.note} onChange={handleChange} />
          </FieldGroup>
        </>
      );

      case 'payment-received': return (
        <>
          <SectionTitle icon={<IndianRupee style={{ width: 14, height: 14 }} />} label="Payment Received" color={E.warning} />
          <FieldGroup>
            <Row2>
              <Field label="Timestamp" value={formData.timestamp} disabled icon={<Clock style={{ width: 14, height: 14 }} />} />
              <Field label="PI No." value={formData.piNo} disabled icon={<Hash style={{ width: 14, height: 14 }} />} />
            </Row2>
            <Row2>
              <Field label="Party Name" value={formData.partyName} disabled icon={<User style={{ width: 14, height: 14 }} />} />
              <Field label="PI Amount" value={formData.piAmount} disabled icon={<IndianRupee style={{ width: 14, height: 14 }} />} />
            </Row2>
            <div style={{ borderTop: `1px solid ${B[100]}`, paddingTop: '0.65rem' }}>
              <Field label="Collected Amount" name="collectedAmount" type="number"
                value={formData.collectedAmount ?? ''} onChange={handleChange} />
            </div>
          </FieldGroup>
        </>
      );

      case 'partner-payout': return (
        <>
          <SectionTitle icon={<User style={{ width: 14, height: 14 }} />} label="Partner Pay Form" color={E.primaryDark} />
          <FieldGroup>
            <Row2>
              <Field label="PI No." value={formData.piNo} disabled icon={<Hash style={{ width: 14, height: 14 }} />} />
              <Field label="Client Name" value={formData.partyName} disabled icon={<User style={{ width: 14, height: 14 }} />} />
            </Row2>
            <Field label="Amount" name="amount" type="number" value={formData.amount ?? ''} onChange={handleChange} />
            <Field label="Note" name="note" value={formData.note} onChange={handleChange} />
          </FieldGroup>
        </>
      );

      case 'vendor-payment': return (
        <>
          <SectionTitle icon={<Truck style={{ width: 14, height: 14 }} />} label="Vendor Payment Form" color={E.danger} />
          <FieldGroup>
            <Row2>
              <Field label="PI No." value={formData.piNo} disabled icon={<Hash style={{ width: 14, height: 14 }} />} />
              <SearchableSelect label="Vendor Name" name="vendorName" value={formData.vendorName} onChange={handleChange} options={masterData?.items || []} icon={<Truck style={{ width: 14, height: 14 }} />} />
            </Row2>
            <Row2>
              <Field label="Amount" name="vendorAmount" type="number" value={formData.vendorAmount ?? ''} onChange={handleChange} />
              <Field label="China Currency" name="chinaCurrency" type="number" value={formData.chinaCurrency ?? ''} onChange={handleChange} />
            </Row2>
            <Row2>
              <Field label="Actual Amount" name="actualAmount" type="number" value={formData.actualAmount ?? ''} onChange={handleChange} />
              <Field label="Note" name="note" value={formData.note} onChange={handleChange} />
            </Row2>
          </FieldGroup>
        </>
      );

      default: return null;
    }
  };


  /* ── Inline mode (PI received page) ── */
  if (isInline) return (
    <div style={{
      background: '#fff', border: `1px solid ${E.border}`,
      borderRadius: '1.5rem', overflow: 'hidden',
      boxShadow: 'var(--shadow-premium)', fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      <div style={{ padding: '1.1rem 1.5rem', borderBottom: `1px solid ${B[100]}`, background: B[50] }}>
        <h2 style={{
          fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800,
          color: B[900], letterSpacing: '-0.01em'
        }}>New PI Entry</h2>
        <p style={{ fontSize: '0.75rem', color: B[500], marginTop: 2 }}>Create a new PI record</p>
      </div>
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {renderFields()}
        <div style={{ marginTop: '1rem' }}>
          <SaveBtn label="Save PI Entry" onClick={handleSave} submitting={submitting} />
        </div>
      </div>
      <datalist id="party-list">{masterData?.parties.map((p, i) => <option key={i} value={p} />)}</datalist>
      <datalist id="item-list">{masterData?.items.map((it, i) => <option key={i} value={it} />)}</datalist>
    </div>
  );

  /* ── Modal mode ── */
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(26,15,8,0.45)', backdropFilter: 'blur(10px)',
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        style={{
          width: '100%', maxWidth: 560,
          background: '#fff', borderRadius: '1.75rem',
          border: `1px solid ${B[200]}`,
          boxShadow: '0 32px 80px rgba(59, 130, 246, 0.25)',
          display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.35rem', borderBottom: `1px solid ${B[100]}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: B[50], flexShrink: 0
        }}>
          <div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: 800,
              color: B[900], letterSpacing: '-0.01em'
            }}>
              {initialData ? `Update: ${STEPS.find(s => s.id === currentStep)?.label}` : 'New PI Entry'}
            </h2>
            <p style={{ fontSize: '0.7rem', color: B[500], marginTop: 2 }}>
              {initialData ? `Updating ${formData.piNo}` : 'Create a new PI record'}
            </p>
          </div>
          <button onClick={onClose}
            style={{
              padding: '0.45rem', background: '#fff', border: `1px solid ${B[200]}`,
              borderRadius: '0.6rem', cursor: 'pointer', color: B[500], display: 'flex', alignItems: 'center',
              transition: 'all 0.18s'
            }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#fff1f2'; b.style.color = '#e11d48'; b.style.borderColor = '#fecdd3'; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#fff'; b.style.color = B[500]; b.style.borderColor = B[200]; }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.1rem 1.35rem' }} className="no-scrollbar">
          {renderFields()}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.9rem 1.35rem', borderTop: `1px solid ${B[100]}`,
          display: 'flex', gap: '0.6rem', flexShrink: 0, background: '#fff'
        }}>
          <button onClick={onClose}
            style={{
              padding: '0.75rem 1.25rem', background: B[50],
              border: `1px solid ${B[200]}`, borderRadius: '0.875rem',
              fontSize: '0.8rem', fontWeight: 700, color: B[700],
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.18s'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = B[100]; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = B[50]; }}>
            Cancel
          </button>
          <SaveBtn flex={2} label={initialData ? 'Update Step' : 'Save PI Entry'} onClick={() => handleSave(false)} submitting={submitting} />
        </div>
      </motion.div>

      <datalist id="party-list">{masterData?.parties.map((p, i) => <option key={i} value={p} />)}</datalist>
      <datalist id="item-list">{masterData?.items.map((it, i) => <option key={i} value={it} />)}</datalist>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
};