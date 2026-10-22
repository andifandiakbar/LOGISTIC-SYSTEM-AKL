import { Jobsheet } from './types';

const li = (id: string, description: string, amount: number, vendor = '') => ({ id, description, amount, vendor });

export const mockJobsheets: Jobsheet[] = [
  {
    id: 'js-1', status: 'Approved',
    header: {
      refNo: 'JS2605035', invoiceNo: 'AKL-26050035', date: '2026-05-30', sales: 'Intan Permatasari',
      shipper: 'PT. Indah Logistik', masterBL: 'SBY2602318000009', houseBL: 'SBY2602318000009',
      destination: 'Makassar', consignee: 'PT. Indah Logistik', activity: 'FCL DOMESTIK',
      carrier: 'PT. Tanto Intim Line', vessel: 'KM. Tanto Keluarga V.180', departure: 'Makassar',
      party: 'DRYU2320958 TAKU2228891', dimension: '2X20FT',
      termOfPayment: 'CASH', creditTerm: 'CASH', debitur: 'PT. Indah Logistik',
    },
    ar: [li('ar1', 'Delivery Cost Port-Warehouse', 5800000)],
    ap: [
      li('ap1', 'DO Release', 560000, 'PT. Tanto Intim Line'),
      li('ap2', 'THC', 2029502, 'PT. Pelabuhan Indonesia'),
      li('ap3', 'DP Trucking Gudang Indah Logistik', 600000, 'To Order'),
      li('ap4', 'PLNS Trucking Gudang Indah Logistik', 500000, 'To Order'),
      li('ap5', 'Buruh', 600000, 'To Order'),
      li('ap6', 'Refund', 200000, 'To Order'),
      li('ap7', 'Perpanjangan DO', 180000, 'PT. Tanto Intim Line'),
    ],
    ctc: [
      li('c1', 'Demurrage', 360000, 'PT. Tanto Intim Line'),
      li('c2', 'Storage', 0, 'PT. Pelabuhan Indonesia'),
    ],
    taxRate: 0.5, taxEnabled: false, // sesuai kertas: label 0,5% tetapi nilai "-"
    signatures: { preparedBy: 'Agus', approvedBy: 'Intan Permatasari', acknowledgedBy: 'Suwanto' },
  },
];