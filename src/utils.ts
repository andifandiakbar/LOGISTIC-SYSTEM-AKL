import { Jobsheet, LineItem, Totals } from './types';

export const rupiah = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(n));
export const uid = () => Math.random().toString(36).slice(2, 9);
const sum = (items: LineItem[]) => items.reduce((s, i) => s + (Number(i.amount) || 0), 0);

export function calcTotals(js: Pick<Jobsheet, 'ar' | 'ap' | 'ctc' | 'taxRate' | 'taxEnabled'>): Totals {
  const totalAR = sum(js.ar);
  const totalAP = sum(js.ap);
  const totalCTC = sum(js.ctc);
  const grossProfit = totalAR - totalAP;
  const tax = js.taxEnabled ? Math.max(0, (totalAR * js.taxRate) / 100) : 0;
  return { totalAR, totalAP, totalCTC, grossProfit, tax, netProfit: grossProfit - tax };
}

export const emptyJobsheet = (): Jobsheet => ({
  id: uid(), status: 'Draft',
  header: {
    refNo: '', invoiceNo: '', date: new Date().toISOString().slice(0, 10), sales: '', shipper: '',
    masterBL: '', houseBL: '', destination: '', consignee: '', activity: 'FCL DOMESTIK',
    carrier: '', vessel: '', departure: '', party: '', dimension: '',
    termOfPayment: 'CASH', creditTerm: 'CASH', debitur: '',
  },
  ar: [], ap: [], ctc: [], taxRate: 0, taxEnabled: false,
  signatures: { preparedBy: '', approvedBy: '', acknowledgedBy: '' },
});