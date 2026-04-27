import { FMSRow, Step, AppData, MasterData, PaymentRecord, FMSItem } from './types';

const PROVIDED_URL = 'https://script.google.com/macros/s/AKfycbyufbAm6QCLpO2lM65xP-S7DTVv5S8XZByQV0nvQZTT72pqQwLXvhK7cXIugOW3LHTH/exec';
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
    const response = await fetch(`${APPS_SCRIPT_URL}?action=read_all&t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch data');
    const allData = await response.json();
    
    const piMasterRaw = (allData["Pi Master"] || allData["PI Receipt"] || []).slice(1);
    const fmsRaw = (allData["FMS"] || []).slice(1);
    const vendorPaymentsRaw = (allData["Vendor Payment"] || []).slice(1);
    const partnerPaymentsRaw = (allData["Partner Pay"] || []).slice(1);

    // Aggregate Vendor Payments by PI No.
    const vendorAmountMap: Record<string, number> = {}; // Base Amount sum
    const actualAmountMap: Record<string, number> = {}; // Actual Amount sum
    const chinaCurrencyMap: Record<string, number> = {}; // Latest China Currency
    const vendorNoteMap: Record<string, string> = {}; // Latest Note

    vendorPaymentsRaw.forEach((row: any[]) => {
      const pi = (row[0] || '').toString().trim();
      const baseAmt = Number(row[2]) || 0;
      const cur = Number(row[3]) || 0;
      const actualAmt = Number(row[4]) || 0;
      const note = String(row[5] || '');

      if (pi) {
        vendorAmountMap[pi] = (vendorAmountMap[pi] || 0) + baseAmt;
        actualAmountMap[pi] = (actualAmountMap[pi] || 0) + actualAmt;
        if (cur) chinaCurrencyMap[pi] = cur; // Keep latest
        if (note) vendorNoteMap[pi] = note; // Keep latest
      }
    });

    // Aggregate Partner Payments by PI No.
    const partnerPaidMap: Record<string, number> = {};
    partnerPaymentsRaw.forEach((row: any[]) => {
      const pi = (row[0] || '').toString().trim();
      const amt = Number(row[3]) || 0;
      if (pi) partnerPaidMap[pi] = (partnerPaidMap[pi] || 0) + amt;
    });

    const piRowsRaw = piMasterRaw.map((row: any[]) => {
      const pi = mapPiMasterRow(row);
      // Aggregate totals from history
      pi.vendorAmount = vendorAmountMap[pi.piNo] || 0; // Base Amount sum
      pi.actualAmount = actualAmountMap[pi.piNo] || 0; // Actual Amount sum
      pi.chinaCurrency = chinaCurrencyMap[pi.piNo] || 0; // Latest rate
      pi.note = vendorNoteMap[pi.piNo] || pi.note; // Latest note
      
      pi.amount = partnerPaidMap[pi.piNo] || 0; // Partner paid total
      return pi;
    });

    // Deduplicate: Keep only the latest row for each PI No.
    const uniquePiMap: Record<string, FMSRow> = {};
    piRowsRaw.forEach(row => {
      if (row.piNo) uniquePiMap[row.piNo] = row;
    });
    const piRows = Object.values(uniquePiMap);
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

    const masterRaw = (allData["Master"] || []).slice(1);
    const master: MasterData = {
      parties: [...new Set(masterRaw.map((r: any[]) => String(r[0])).filter(Boolean) as string[])],
      items: [...new Set(masterRaw.map((r: any[]) => String(r[1])).filter(Boolean) as string[])]
    };

    const records = piRows.map(piRow => {
      const piKey = cleanPiNo(piRow.piNo);
      const fmsData = fmsDict[piKey] || {};
      
      return { 
        ...piRow, 
        ...fmsData, 
        vendorAmount: piRow.vendorAmount, // Sum of base Amount
        actualAmount: piRow.actualAmount, // Sum of Actual Amount
        chinaCurrency: piRow.chinaCurrency, // Latest rate
        amount: piRow.amount // From history (Partner Paid)
      };
    });

    const vPayments: PaymentRecord[] = vendorPaymentsRaw.map(r => ({
      piNo: String(r[0] || ''),
      name: String(r[1] || ''),
      amount: Number(r[2]) || 0,
      chinaCurrency: Number(r[3]) || 0,
      actualAmount: Number(r[4]) || 0,
      note: String(r[5] || ''),
      date: String(r[6] || '')
    }));

    const pPayments: PaymentRecord[] = partnerPaymentsRaw.map(r => ({
      piNo: String(r[0] || ''),
      date: String(r[1] || ''),
      name: String(r[2] || ''),
      amount: Number(r[3]) || 0,
      note: String(r[4] || '')
    }));

    return { 
      records, 
      master,
      vendorPayments: vPayments,
      partnerPayments: pPayments
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { records: [], master: { parties: [], items: [] }, vendorPayments: [], partnerPayments: [] };
  }
}

export const formatTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
};

export async function saveData(data: any, step?: Step): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return true;

  if (step === 'save-master') {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'save-master', data })
      });
      return true;
    } catch (e) { return false; }
  }

  const row = data as Partial<FMSRow>;
  // 1. Determine Target Sheet more reliably
  let targetSheet = "Pi Master";
  if (step === 'vendor-payment') targetSheet = "Vendor Payment";
  if (step === 'partner-payout') targetSheet = "Partner Pay";

  // 2. Filter payload to ONLY include meaningful data for the current step
  const filteredData: any = {
    sheetName: (row as any).sheetName || targetSheet,
    step: step,
    timestamp: row.originalTimestamp || row.timestamp || formatTimestamp(),
  };

  filteredData.piNo = cleanPiNo(row.piNo || '');
  filteredData.partyName = row.partyName;
  filteredData.piAmount = row.piAmount;
  filteredData.vendorName = row.vendorName;
  filteredData.totalPurchaseAmount = row.totalPurchaseAmount;
  filteredData.piCopy = row.piCopy;

  const keysByStep: Record<string, string[]> = {
    'pi-received': ['vendorName', 'totalPurchaseAmount', 'piCopy', 'note'],
    'pi-approval': ['approval', 'note'],
    'payment-received': ['collectedAmount', 's3_actual'],
    'partner-payout': ['amount', 's4_actual', 's5_planned', 'pay1', 'pay2', 'pay3', 'pay4', 'pay5', 'pay6', 'pay7', 'pay8', 'pay9', 'pay10'],
    'vendor-payment': ['vendorName', 'vendorAmount', 'chinaCurrency', 'actualAmount', 's5_actual', 'note', 'vendorPay1', 'vendorPay2', 'vendorPay3', 'vendorPay4', 'vendorPay5', 'vendorPay6', 'vendorPay7', 'vendorPay8', 'vendorPay9', 'vendorPay10']
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
    // Using text/plain for the body prevents the browser from sending an OPTIONS preflight request, 
    // which Google Apps Script cannot handle. This significantly improves speed and avoids CORS issues.
    const action = (step === 'vendor-payment' || step === 'partner-payout') ? step : 'write';
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ action: action, data: payload }),
    });
    
    // Since we use no-cors, we can't read the response, but the user confirmed it's saving.
    // We assume success to keep the UI snappy.
    return true;
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
    itemName: '', qty: 0, remark: '',
    piCopy: getVal(4),
    vendorName: getVal(5),
    totalPurchaseAmount: Number(getVal(6)) || 0,
    s2_planned: '', s2_actual: '', s2_delay: '',
    approval: getVal(11), note: getVal(12),
    items: [],
    collectedAmount: 0, s1_planned: '', s1_actual: '', s1_delay: '',
    s3_planned: '', s3_actual: '', s3_delay: '', s4_planned: '', s4_actual: '', s4_delay: '',
    amount: 0, s5_planned: '', s5_actual: '', s5_delay: '', vendorAmount: 0,
    originalTimestamp: getVal(0), originalPiNo: getVal(1)
  };
}
