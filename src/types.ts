export type Status = 'Draft' | 'Approved' | 'Selesai';

export interface JobsheetHeader {
  refNo: string; invoiceNo: string; date: string; sales: string;
  shipper: string; masterBL: string; houseBL: string; destination: string;
  consignee: string; activity: string; carrier: string; vessel: string;
  departure: string; party: string; dimension: string;
  termOfPayment: string; creditTerm: string; debitur: string;
}

export interface LineItem {
  id: string; description: string; amount: number; vendor: string;
}

export interface Signatures { preparedBy: string; approvedBy: string; acknowledgedBy: string }

export interface Jobsheet {
  id: string; status: Status;
  header: JobsheetHeader;
  ar: LineItem[]; ap: LineItem[]; ctc: LineItem[];
  taxRate: number; // persen, mis. 0.5 untuk PPh Final PP 23
  taxEnabled: boolean; // true = pajak PP 23 dikenakan
  signatures: Signatures;
}

export interface Totals {
  totalAR: number; totalAP: number; totalCTC: number;
  grossProfit: number; tax: number; netProfit: number;
}
