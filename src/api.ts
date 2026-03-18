import { FMSRow, Step, AppData, MasterData } from './types';

const PROVIDED_URL = 'https://script.google.com/macros/s/AKfycbx-wzUeJ1hnD6saK353z4cL4Z41_aCtgQsaVAzv8C4VYhXVJb_XR0YxzffDI1ntQ1ki/exec';
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL && !import.meta.env.VITE_APPS_SCRIPT_URL.includes('...') 
  ? import.meta.env.VITE_APPS_SCRIPT_URL 
  : PROVIDED_URL;

const cleanPiNo = (val: string) => (val || '').replace(/[^\x20-\x7E]/g, '').trim();

export async function loginUser(username: string, password: string): Promise<any> {
  if (!APPS_SCRIPT_URL) return null;
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', data: { username, password } })
    });
    const result = await response.json();
    return result.status === 'success' ? result.user : null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export async function uploadFile(file: File): Promise<{ url: string | null; error?: string }> {
  if (!APPS_SCRIPT_URL) return { url: null, error: 'No API URL' };
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'upload_file',
            data: {
              base64,
              fileName: file.name,
              mimeType: file.type
            }
          })
        });
        const result = await response.json();
        if (result.status === 'success') {
          resolve({ url: result.url });
        } else {
          resolve({ url: null, error: result.message || 'Server error' });
        }
      } catch (error) {
        console.error('Upload error details:', error);
        resolve({ url: null, error: 'Network or Script Error' });
      }
    };
    reader.onerror = () => resolve({ url: null, error: 'File read error' });
    reader.readAsDataURL(file);
  });
}

export async function fetchData(): Promise<AppData> {
  if (!APPS_SCRIPT_URL) return { records: [], master: { parties: [], items: [] } };
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=read_all`);
    if (!response.ok) throw new Error('Failed to fetch data');
    const allData = await response.json();
    
    const piMasterRaw = allData["Pi Master"] || [];
    const fmsRaw = allData["FMS"] || [];

    const piRows = piMasterRaw.map((row: any[]) => mapPiMasterRow(row));
    const fmsDict: Record<string, any> = {};
    
    fmsRaw.forEach((row: any[]) => {
      const piKey = cleanPiNo(String(row[1]));
      const existing = fmsDict[piKey] || {
        collectedAmount: 0,
        s3_actual: '',
        s3_planned: '',
        s4_planned: '',
        s4_actual: '',
        s4_delay: '',
        amount: 0,
        s5_planned: '',
        s5_actual: '',
        s5_delay: '',
        vendorName: '',
        vendorAmount: 0
      };

      const rowCollected = Number(row[4]) || 0;
      const rowPayout = Number(row[8]) || 0;
      const rowVendorAmt = Number(row[13]) || 0;

      fmsDict[piKey] = {
        collectedAmount: existing.collectedAmount + rowCollected,
        s3_actual: ensureDateFormat(row[3]) || existing.s3_actual,
        s4_planned: ensureDateFormat(row[5]) || existing.s4_planned,
        s4_actual: ensureDateFormat(row[6]), // Take latest
        s4_delay: String(row[7]),
        amount: existing.amount + rowPayout,
        s5_planned: ensureDateFormat(row[9]) || existing.s5_planned,
        s5_actual: ensureDateFormat(row[10]), // Take latest
        s5_delay: String(row[11]),
        vendorName: String(row[12]) || existing.vendorName,
        vendorAmount: existing.vendorAmount + rowVendorAmt
      };
    });

    const masterRaw = allData["Master"] || [];
    const master: MasterData = {
      parties: [...new Set(masterRaw.map((r: any[]) => String(r[0])).filter(Boolean) as string[])],
      items: [...new Set(masterRaw.map((r: any[]) => String(r[1])).filter(Boolean) as string[])]
    };

    const records = piRows.map(piRow => {
      const piKey = cleanPiNo(piRow.piNo);
      return fmsDict[piKey] ? { ...piRow, ...fmsDict[piKey] } : piRow;
    });

    return { records, master };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { records: [], master: { parties: [], items: [] } };
  }
}

export const formatTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
};

export async function saveData(row: Partial<FMSRow>, step?: Step): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return true;

  // 1. Determine Target Sheet more reliably
  let targetSheet = "Pi Master";
  if (['payment-received', 'partner-payout', 'vendor-payment'].includes(step || '')) {
    targetSheet = "FMS";
  }

  // 2. Filter payload to ONLY include meaningful data for the current step
  const filteredData: any = {
    sheetName: targetSheet,
    step: step,
    timestamp: row.originalTimestamp || row.timestamp || formatTimestamp(),
    piNo: cleanPiNo(row.piNo || ''),
    partyName: row.partyName,
    piAmount: row.piAmount
  };

  const keysByStep: Record<string, string[]> = {
    'pi-received': ['itemName', 'qty', 'remark', 's1_planned', 's1_actual', 's2_planned', 'piCopy'],
    'pi-approval': ['s2_actual', 'approval', 'note', 's3_planned'],
    'payment-received': ['collectedAmount', 's3_actual'],
    'partner-payout': ['amount', 's4_actual', 's5_planned'],
    'vendor-payment': ['vendorName', 'vendorAmount', 's5_actual']
  };

  if (step && keysByStep[step]) {
    keysByStep[step].forEach(k => {
      if ((row as any)[k] !== undefined) filteredData[k] = (row as any)[k];
    });
  }

  console.log(`API: Sending to ${targetSheet} for step ${step}:`, filteredData);

  const payload = (step === 'pi-received' && row.items && row.items.length > 0)
    ? row.items.map(item => ({ ...filteredData, itemName: item.name, qty: item.qty }))
    : [filteredData];

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'write', data: payload }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

function ensureDateFormat(val: any): string {
  if (!val || val === 'undefined' || val === 'null' || val === '-') return '';
  const date = new Date(val);
  if (isNaN(date.getTime())) return String(val);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function mapPiMasterRow(row: any[]): FMSRow {
  const getVal = (idx: number) => (row && row[idx] !== undefined ? String(row[idx]) : '');
  const cleanPi = cleanPiNo(getVal(1));
  return {
    timestamp: getVal(0), piNo: cleanPi, partyName: getVal(2), piAmount: Number(getVal(3)) || 0,
    itemName: getVal(4), qty: Number(getVal(5)) || 0, remark: getVal(6),
    piCopy: getVal(7),
    s2_planned: getVal(8), s2_actual: getVal(9), s2_delay: getVal(10),
    approval: getVal(11), note: getVal(12),
    items: [{ name: getVal(4), qty: Number(getVal(5)) || 0 }],
    collectedAmount: 0, s1_planned: '', s1_actual: '', s1_delay: '',
    s3_planned: '', s3_actual: '', s3_delay: '', s4_planned: '', s4_actual: '', s4_delay: '',
    amount: 0, s5_planned: '', s5_actual: '', s5_delay: '', vendorName: '', vendorAmount: 0,
    originalTimestamp: getVal(0), originalPiNo: getVal(1)
  };
}
