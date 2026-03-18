// EntryForm.tsx — Warm Brown & White Theme
import React, { useState, useEffect } from 'react';
import { FMSRow, Step, STEPS, FMSItem, MasterData } from '../types';
import { cn } from '../utils';
import { formatTimestamp, uploadFile } from '../api';
import {
  Save, X, User, Hash, FileText, CheckCircle2, IndianRupee, Truck,
  ClipboardList, Clock, Plus, Trash2, RefreshCw, Paperclip, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EntryFormProps {
  onSave: (data: Partial<FMSRow>, step: Step) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<FMSRow>;
  initialStep?: Step;
  allData?: FMSRow[];
  isInline?: boolean;
  masterData?: MasterData;
}

const B = {
  900: '#2d1810', 800: '#4a2c1a', 700: '#6b3f27', 600: '#8b5435',
  500: '#a86b44', 400: '#c4895f', 300: '#d9a882', 200: '#e8c9aa',
  100: '#f3e2d0', 50: '#faf4ee', cream: '#fdf8f3',
};

/* ── Shared Input ── */
const Field = ({ label, icon, ...props }: any) => (
  <div>
    {label && (
      <label style={{
        display: 'block', fontSize: '0.65rem', fontWeight: 700,
        color: B[500], letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.35rem'
      }}>
        {label}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{
          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
          color: B[400], display: 'flex', alignItems: 'center', pointerEvents: 'none'
        }}>
          {icon}
        </span>
      )}
      <input {...props}
        style={{
          width: '100%', padding: icon ? '0.65rem 0.85rem 0.65rem 2.25rem' : '0.65rem 0.85rem',
          background: props.disabled ? B[50] : '#fff',
          border: `1.5px solid ${B[200]}`, borderRadius: '0.7rem',
          fontSize: '0.82rem', fontWeight: 500, color: props.disabled ? B[400] : B[900],
          fontFamily: 'DM Sans, sans-serif',
          transition: 'border-color 0.18s, box-shadow 0.18s',
          boxSizing: 'border-box',
          cursor: props.disabled ? 'not-allowed' : 'text',
          ...props.style,
        }}
        onFocus={e => { if (!props.disabled) { e.target.style.borderColor = B[600]; e.target.style.boxShadow = `0 0 0 3px rgba(139,84,53,0.1)`; } }}
        onBlur={e => { e.target.style.borderColor = B[200]; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  </div>
);

/* ── Section label ── */
const SectionTitle = ({ icon, label, color = B[800] }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
    <div style={{
      width: 30, height: 30, borderRadius: '0.55rem', background: `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0
    }}>
      {icon}
    </div>
    <span style={{
      fontSize: '0.7rem', fontWeight: 700, color: B[700],
      letterSpacing: '0.1em', textTransform: 'uppercase'
    }}>{label}</span>
  </div>
);

/* ── Card wrapper ── */
const FieldGroup = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: B.cream || B[50], border: `1px solid ${B[100]}`,
    borderRadius: '1rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
  }}>
    {children}
  </div>
);

const Row2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
    {children}
  </div>
);

/* ── File Upload area ── */
const PiCopyUpload = ({ piCopy, uploading, onUpload, onClear }: any) => (
  <div style={{ background: `${B[50]}`, border: `1.5px solid ${B[200]}`, borderRadius: '0.875rem', padding: '0.85rem' }}>
    <p style={{
      fontSize: '0.62rem', fontWeight: 700, color: B[500],
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
            width: 28, height: 28, background: B[100], borderRadius: '0.45rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: B[700]
          }}>
            <Paperclip style={{ width: 13, height: 13 }} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: B[900], lineHeight: 1 }}>Document Linked</p>
            <p style={{ fontSize: '0.62rem', color: B[400], marginTop: 2 }}>Ready to save</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <a href={piCopy} target="_blank" rel="noopener noreferrer"
            style={{
              padding: '0.35rem', background: B[50], border: `1px solid ${B[200]}`,
              borderRadius: '0.45rem', color: B[700], display: 'flex', alignItems: 'center',
              transition: 'all 0.18s', textDecoration: 'none'
            }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = B[800]; a.style.color = '#fff'; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = B[50]; a.style.color = B[700]; }}>
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
              <RefreshCw style={{ width: 16, height: 16, color: B[500], animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: B[500] }}>Uploading to Drive…</span>
            </>
          ) : (
            <>
              <div style={{
                width: 28, height: 28, background: B[100], borderRadius: '0.45rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: B[700]
              }}>
                <Paperclip style={{ width: 13, height: 13 }} />
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: B[800], lineHeight: 1 }}>Upload PDF / Image</p>
                <p style={{ fontSize: '0.62rem', color: B[400], marginTop: 2 }}>Saved to Google Drive instantly</p>
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
      flex, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
      background: `linear-gradient(135deg, ${B[800]}, ${B[600]})`, color: '#fff',
      border: 'none', borderRadius: '0.875rem', fontSize: '0.8rem', fontWeight: 700,
      cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif',
      opacity: submitting ? 0.7 : 1, boxShadow: `0 6px 18px rgba(74,44,26,0.28)`,
      letterSpacing: '0.04em', transition: 'filter 0.18s',
    }}
    onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}>
    {submitting
      ? <RefreshCw style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
      : <Save style={{ width: 15, height: 15 }} />}
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
    timestamp: formatTimestamp(), piNo: '', partyName: '', piAmount: 0,
    items: [{ name: '', qty: 0 }], remark: '', approval: '', note: '',
    collectedAmount: 0, amount: 0, vendorName: '', vendorAmount: 0, piCopy: '',
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
    setFormData(p => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
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

  const handleSave = async () => {
    if (submitting) return;
    if (!formData.piNo) { alert('PI No. required'); return; }
    if (!formData.partyName) { alert('Party Name required'); return; }
    if (!formData.items?.[0]?.name) { alert('At least one item required'); return; }

    setSubmitting(true);
    try {
      const now = formatTimestamp();
      const save = { ...formData };
      if (currentStep === 'pi-received') { save.s1_actual = now; }
      if (currentStep === 'pi-approval') { save.s2_actual = now; }
      if (currentStep === 'payment-received') { save.s3_actual = now; }
      if (currentStep === 'partner-payout') { save.s4_actual = now; save.s5_planned = now; }
      if (currentStep === 'vendor-payment') { save.s5_actual = now; }
      // if (!initialData) save.s1_planned = now;
      await onSave(save, currentStep);
    } catch { setSubmitting(false); }
  };

  /* ── Step-specific form fields ── */
  const renderFields = () => {
    switch (currentStep) {
      case 'pi-received': return (
        <>
          <SectionTitle icon={<ClipboardList style={{ width: 14, height: 14 }} />} label="PI Received Details" />
          <FieldGroup>
            <Row2>
              <Field label="Timestamp" name="timestamp" value={formData.timestamp} onChange={handleChange} icon={<Clock style={{ width: 14, height: 14 }} />} />
              <Field label="PI No." name="piNo" value={formData.piNo} onChange={handleChange} icon={<Hash style={{ width: 14, height: 14 }} />} disabled />
            </Row2>
            <Row2>
              <Field label="Party Name" name="partyName" value={formData.partyName} onChange={handleChange} icon={<User style={{ width: 14, height: 14 }} />} list="party-list" />
              <Field label="PI Amount" name="piAmount" value={formData.piAmount} onChange={handleChange} type="number" icon={<IndianRupee style={{ width: 14, height: 14 }} />} />
            </Row2>
            <PiCopyUpload piCopy={formData.piCopy} uploading={uploading} onUpload={handleFileUpload}
              onClear={() => setFormData(p => ({ ...p, piCopy: '' }))} />
            {/* Items */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{
                  fontSize: '0.65rem', fontWeight: 700, color: B[500],
                  letterSpacing: '0.09em', textTransform: 'uppercase'
                }}>Items</label>
                <button onClick={addItem} style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.3rem 0.65rem', background: B[50],
                  border: `1px solid ${B[200]}`, borderRadius: '0.5rem',
                  fontSize: '0.68rem', fontWeight: 700, color: B[700], cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  <Plus style={{ width: 12, height: 12 }} /> Add
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
                    background: '#fff', border: `1px solid ${B[100]}`, borderRadius: '0.7rem', padding: '0.6rem'
                  }}>
                    <div style={{ flex: 3 }}>
                      <Field value={item.name} onChange={(e: any) => handleItemChange(idx, 'name', e.target.value)}
                        placeholder="Item name" list="item-list" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Field type="number" value={item.qty} onChange={(e: any) => handleItemChange(idx, 'qty', e.target.value)}
                        placeholder="Qty" />
                    </div>
                    <button onClick={() => removeItem(idx)} style={{
                      padding: '0.5rem', background: '#fff', border: '1px solid #fecdd3',
                      borderRadius: '0.5rem', color: '#e11d48', cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center',
                    }}>
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <Field label="Remark" name="remark" value={formData.remark} onChange={handleChange}
              icon={<FileText style={{ width: 14, height: 14 }} />} />
          </FieldGroup>
        </>
      );

      case 'pi-approval': return (
        <>
          <SectionTitle icon={<CheckCircle2 style={{ width: 14, height: 14 }} />} label="PI Approval" color="#16a34a" />
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
          <SectionTitle icon={<IndianRupee style={{ width: 14, height: 14 }} />} label="Payment Received" color="#b45309" />
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
                value={formData.collectedAmount} onChange={handleChange} />
            </div>
          </FieldGroup>
        </>
      );

      case 'partner-payout': return (
        <>
          <SectionTitle icon={<User style={{ width: 14, height: 14 }} />} label="Partner Payout" color="#7c3aed" />
          <FieldGroup>
            <Field label="Payout Amount" name="amount" type="number" value={formData.amount} onChange={handleChange} />
          </FieldGroup>
        </>
      );

      case 'vendor-payment': return (
        <>
          <SectionTitle icon={<Truck style={{ width: 14, height: 14 }} />} label="Vendor Payment" color="#dc2626" />
          <FieldGroup>
            <Field label="Vendor Name" name="vendorName" value={formData.vendorName} onChange={handleChange} />
            <Field label="Vendor Amount" name="vendorAmount" value={formData.vendorAmount} onChange={handleChange} type="number" />
          </FieldGroup>
        </>
      );

      default: return null;
    }
  };


  /* ── Inline mode (PI received page) ── */
  if (isInline) return (
    <div style={{
      background: '#fff', border: `1px solid ${B[100]}`,
      borderRadius: '1.5rem', overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(74,44,26,0.07)', fontFamily: 'DM Sans, sans-serif'
    }}>
      <div style={{ padding: '1.1rem 1.5rem', borderBottom: `1px solid ${B[100]}`, background: B[50] }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700,
          color: B[900], letterSpacing: '-0.01em'
        }}>New PI Entry</h2>
        <p style={{ fontSize: '0.72rem', color: B[500], marginTop: 2 }}>Create a new PI record</p>
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
          border: `1px solid ${B[100]}`,
          boxShadow: '0 32px 80px rgba(74,44,26,0.2)',
          display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden',
          fontFamily: 'DM Sans, sans-serif',
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
              fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', fontWeight: 700,
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
              flex: 1, padding: '0.75rem', background: B[50],
              border: `1px solid ${B[200]}`, borderRadius: '0.875rem',
              fontSize: '0.8rem', fontWeight: 600, color: B[700],
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.18s'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = B[100]; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = B[50]; }}>
            Cancel
          </button>
          <SaveBtn flex={2} label={initialData ? 'Update Step' : 'Save PI Entry'} onClick={handleSave} submitting={submitting} />
        </div>
      </motion.div>

      <datalist id="party-list">{masterData?.parties.map((p, i) => <option key={i} value={p} />)}</datalist>
      <datalist id="item-list">{masterData?.items.map((it, i) => <option key={i} value={it} />)}</datalist>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
};