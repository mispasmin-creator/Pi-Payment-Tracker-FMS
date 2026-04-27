/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Step = 'pi-received' | 'pi-approval' | 'payment-received' | 'partner-payout' | 'vendor-payment' | 'save-master';

export const STEPS: { id: Step; label: string; color: string }[] = [
  { id: 'pi-received', label: 'PI Received', color: '#8b5435' },
  { id: 'pi-approval', label: 'PI Approval', color: '#16a34a' },
  { id: 'payment-received', label: 'Payment Received', color: '#b45309' },
  { id: 'partner-payout', label: 'Partner Payout', color: '#7c3aed' },
  { id: 'vendor-payment', label: 'Vendor Payment', color: '#dc2626' },
];

export interface FMSItem {
  name: string;
  qty: number;
}

export interface FMSRow {
  timestamp: string;
  piNo: string;
  partyName: string;
  piAmount: number; // Mapping to "Total Sales Amount"
  vendorName: string;
  vendorAmount?: number;
  chinaCurrency?: number;
  actualAmount?: number;
  totalPurchaseAmount?: number; // New Field
  piCopy: string;
  note?: string;
  approval?: string;
  collectedAmount?: number;
  amount?: number; // Partner Paid
  
  // Step flags (from FMS sheet)
  s1_planned?: string;
  s1_actual?: string;
  s2_planned?: string;
  s2_actual?: string;
  s3_planned?: string;
  s3_actual?: string;
  s4_planned?: string;
  s4_actual?: string;
  s4_delay?: string;
  s5_planned?: string;
  s5_actual?: string;
  s5_delay?: string;
  
  itemName?: string;
  qty?: number;
  remark?: string;
  items?: FMSItem[];
  s1_delay?: string;
  s2_delay?: string;
  s3_delay?: string;
  
  sheetName?: string; // Metadata
  originalTimestamp?: string; // To prevent overwriting timestamp on update
  originalPiNo?: string;
}

export interface User {
  username: string;
  permissions: {
    overview: boolean;
    history: boolean;
    [key: string]: boolean;
  };
}

export interface MasterData {
  parties: string[];
  items: string[];
}

export interface PaymentRecord {
  piNo: string;
  date: string;
  name: string;
  amount: number;
  note?: string;
  chinaCurrency?: number;
  actualAmount?: number;
}

export interface AppData {
  records: FMSRow[];
  master: MasterData;
  vendorPayments?: PaymentRecord[];
  partnerPayments?: PaymentRecord[];
}
