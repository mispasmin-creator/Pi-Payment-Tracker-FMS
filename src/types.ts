export interface FMSItem {
  name: string;
  qty: number;
  originalTimestamp?: string;
  originalPiNo?: string;
}

export interface FMSRow {
  timestamp: string;
  piNo: string;
  partyName: string;
  piAmount: number;
  items: FMSItem[]; // Array of items
  remark: string;
  piCopy?: string; // Google Drive file link
  
  // For backward compatibility or flat storage if needed
  itemName?: string; 
  qty?: number;
  
  // Step 1: PI Received
  s1_planned: string;
  s1_actual: string;
  s1_delay: string;
  
  // Step 2: PI Approval
  s2_planned: string;
  s2_actual: string;
  s2_delay: string;
  approval: string;
  note: string;
  
  // Step 3: Part Payment Received
  s3_planned: string;
  s3_actual: string;
  s3_delay: string;
  collectedAmount: number;
  
  // Step 4: Partner Payouts
  s4_planned: string;
  s4_actual: string;
  s4_delay: string;
  amount: number; // Partner Payout Amount
  
  // Step 5: Vendor Payment
  s5_planned: string;
  s5_actual: string;
  s5_delay: string;
  vendorName: string;
  vendorAmount: number;
  originalTimestamp?: string;
  originalPiNo?: string;
}

export interface UserPermissions {
  overview: boolean;
  history: boolean;
  'pi-received': boolean;
  'pi-approval': boolean;
  'payment-received': boolean;
  'partner-payout': boolean;
  'vendor-payment': boolean;
}

export interface User {
  username: string;
  permissions: UserPermissions;
}

export type Step = 'pi-received' | 'pi-approval' | 'payment-received' | 'partner-payout' | 'vendor-payment';

export const STEPS: { id: Step; label: string }[] = [
  { id: 'pi-received', label: 'PI Received' },
  { id: 'pi-approval', label: 'PI Approval' },
  { id: 'payment-received', label: 'Part Payment Received' },
  { id: 'partner-payout', label: 'Partner Payouts' },
  { id: 'vendor-payment', label: 'Vendor Payment' },
];

export interface MasterData {
  parties: string[];
  items: string[];
}

export interface AppData {
  records: FMSRow[];
  master: MasterData;
}

