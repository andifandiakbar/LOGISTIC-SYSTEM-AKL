import { Jobsheet, LineItem } from './types';
import { calcTotals } from './utils';

const fmtDate = (d: string) => { const [y, m, day] = d.split('-'); return `${+day}/${+m}/${y}`; };
const num = (n: number) => new Intl.NumberFormat('en-US').format(n);

function Section({ title, bg, items, total, totalLabel, showVendor = true }:
  { title: string; bg: string; items: LineItem[]; total?: number; totalLabel?: string; showVendor?: boolean }) {
  return (
    <div className="jobsheet-section mt-3 border border-black">
      {/* judul section + jarak ke baris DESKRIPSI */}
      <div className="px-1 pb-2 text-[11px] font-bold italic"
        style={{ textDecoration: 'underline', textDecorationSkipInk: 'none' }}>
        {title}
      </div>
      <table className="w-full table-fixed text-[11px]">
        <colgroup>
          <col style={{ width: '45%' }} />
          <col style={{ width: '4%' }} />
          <col style={{ width: '14%' }} />
          <col />
        </colgroup>
        <thead>
          <tr className="text-left">
            <th className="px-1 pb-1.5 font-bold">DESKRIPSI</th>
            <th colSpan={2} />
            <th className="pb-1.5 pl-5 text-left font-bold">{showVendor ? 'PPN  CTC VENDOR' : ''}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td className="whitespace-nowrap px-1 py-[2px] uppercase">{i.description}</td>
              <td className="py-[2px]">Rp</td>
              <td className="py-[2px] pr-4 text-right">{i.amount ? num(i.amount) : '-'}</td>
              <td className="whitespace-nowrap py-[2px] pl-5 uppercase">{showVendor ? i.vendor : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {total !== undefined && (
        <div className={`jobsheet-section-total mt-2 flex justify-between px-1 text-[11px] font-bold ${bg}`}>
          <span>{totalLabel}</span><span>Rp &nbsp; {num(total)}</span>
        </div>
      )}
    </div>
  );
}

export default function JobsheetPreview({ js, onBack }: { js: Jobsheet; onBack: () => void }) {
  const t = calcTotals(js);
  const h = js.header;
  const rows: [string, string, string, string][] = [
    ['REF NO', h.refNo, 'FEEDER/CARRIER', h.carrier],
    ['SHIPPER', h.shipper, 'VESSEL/VOYAGE', h.vessel],
    ['MASTER B/L', h.masterBL, 'DEPARTURE', h.departure],
    ['HOUSE B/L', h.houseBL, 'PARTY', h.dimension],
    ['DESTINATION', h.destination, 'DIMENSION/VOLUME', h.party],
    ['CONSIGNEE', h.consignee, 'TERM OF PAYMENT', h.termOfPayment],
    ['TYPE OF ACTIVITY', h.activity, 'CREDIT TERM', h.creditTerm],
  ];
  return (
    <div className="bg-slate-200 p-4 print:bg-white print:p-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 0 }
          html, body { margin: 0 !important; background: #fff !important }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important }
          .no-print { display: none !important }
          .sheet { width: 210mm !important; height: 296mm !important; min-height: 0 !important; margin: 0 !important; box-shadow: none !important; overflow: hidden !important }
          .sheet .jobsheet-section { padding-bottom: 0 !important }
          .sheet .jobsheet-section-total { margin-bottom: 0 !important }
        }
      `}</style>
      <div className="sheet mx-auto min-h-[297mm] w-[210mm] bg-white p-8 font-sans text-black shadow">
        <div className="flex items-start justify-between">
          <div>
            <img src="/Logo.png" alt="LogoAKL" className="mb-2 h-12 w-auto object-contain" />
            <div className="mt-3 text-[10px] leading-tight">PT ANUGRAH KARUNIA LOGISTIK<br />JL. MUHAMMADIYAH NO. 14 MELAYU, WAJO<br />MAKASSAR, SULAWESI SELATAN</div>
          </div>
          <div className="text-right">
            <div className="text-[10px]">{fmtDate(h.date)}</div>
            <div className="mt-6 text-xl font-bold text-blue-500">JOBSHEET</div>
            <div className="text-[10px]">SALES : {h.sales.toUpperCase()}</div>
          </div>
        </div>

        <table className="mt-3 w-full text-[10px] uppercase">
          <tbody>
            {rows.map(([l1, v1, l2, v2]) => (
              <tr key={l1}>
                <td className="w-28 pl-1">{l1}</td><td className="w-4">:</td><td className="w-56">{v1}</td>
                <td className="w-32">{l2}</td><td className="w-4">:</td><td>{v2}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 px-1 text-[11px] font-bold">DEBITUR &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; : {h.debitur.toUpperCase()}</div>

        <Section title="ACCOUNT RECEIVABLE (AR)" bg="bg-lime-500" items={js.ar} total={t.totalAR} totalLabel="TOTAL AR" showVendor={false} />
        <Section title="ACCOUNT PAYABLE (AP)" bg="bg-red-200" items={js.ap} total={t.totalAP} totalLabel="TOTAL AP" />
        <Section title="COST TO COST (CTC)" bg="" items={js.ctc} />

        <table className="mt-4 w-full text-[11px] font-bold">
          <tbody>
            <tr className="bg-blue-400"><td className="pl-1">PROFIT (RV)</td><td className="w-10">Rp</td><td className="w-28 text-right">{num(t.grossProfit)}</td></tr>
            <tr><td className="pl-1">TAX PP 23 ({js.taxRate}%)</td><td>Rp</td><td className="text-right">{t.tax ? num(t.tax) : '-'}</td></tr>
            <tr className="bg-blue-400"><td className="pl-1">NET PROFIT</td><td>Rp</td><td className="text-right">{num(t.netProfit)}</td></tr>
          </tbody>
        </table>

        <div className="mt-10 grid grid-cols-3 text-center text-[10px] font-bold">
          {([['PREPARED BY', js.signatures.preparedBy], ['APPROVED BY', js.signatures.approvedBy], ['ACKNOWLEDGE BY', js.signatures.acknowledgedBy]] as const).map(([l, n]) => (
            <div key={l}><div>{l}</div><div className="h-20" /><div className="uppercase">{n}</div></div>
          ))}
        </div>
      </div>

      <div className="no-print mx-auto mt-3 flex max-w-[210mm] justify-center gap-2">
        <button className="rounded border bg-white px-3 py-1.5 text-sm transition-colors active:bg-white active:text-red-600" onClick={onBack}>Kembali</button>
        <button className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700" onClick={() => window.print()}>Cetak / PDF</button>
      </div>
    </div>
  );
}