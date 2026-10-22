import { useMemo, useState } from 'react';
import { Jobsheet, JobsheetHeader, LineItem } from './types';
import { calcTotals, rupiah, uid } from './utils';

const HEADER_FIELDS: [keyof JobsheetHeader, string, string?][] = [
  ['refNo', 'Ref No'], ['invoiceNo', 'No. Invoice'], ['date', 'Tanggal', 'date'], ['sales', 'Sales'],
  ['shipper', 'Shipper'], ['consignee', 'Consignee'], ['debitur', 'Debitur'], ['masterBL', 'Master B/L'],
  ['houseBL', 'House B/L'], ['destination', 'Destination'], ['departure', 'Departure'], ['activity', 'Type of Activity'],
  ['carrier', 'Feeder / Carrier'], ['vessel', 'Vessel/Voyage'], ['dimension', 'Dimension'], ['party', 'Party (No. Container)'],
  ['termOfPayment', 'Term of Payment'], ['creditTerm', 'Credit Term'],
];

const inp = 'w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

function NumericInput({ value, onChange, className, min = 0, step, disabled }: {
  value: number; onChange: (value: number) => void; className: string; min?: number; step?: number; disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));

  const handleChange = (raw: string) => {
    const normalized = raw.replace(/^0+(?=\d)/, '');
    setDraft(normalized);
    const parsed = Number(normalized);
    onChange(normalized === '' || !Number.isFinite(parsed) ? 0 : Math.max(min, parsed));
  };

  return (
    <input
      className={className}
      type="number"
      min={min}
      step={step}
      disabled={disabled}
      value={draft}
      onFocus={() => {
        if (value === 0) setDraft('');
      }}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => setDraft(draft === '' ? String(value) : String(Math.max(min, Number(draft) || 0)))}
    />
  );
}

interface TableProps {
  title: string; color: string; items: LineItem[]; vendorLabel?: string;
  onChange: (items: LineItem[]) => void; total: number;
}

function LineTable({ title, color, items, vendorLabel, onChange, total }: TableProps) {
  const update = (id: string, patch: Partial<LineItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={`flex items-center justify-between px-4 py-2 text-sm font-semibold text-white ${color}`}>
        <span>{title}</span>
        <button type="button" className="rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30"
          onClick={() => onChange([...items, { id: uid(), description: '', amount: 0, vendor: '' }])}>
          + Tambah Baris
        </button>
      </div>
      <div className="space-y-2 p-3">
        {items.length === 0 && <p className="py-2 text-center text-sm text-slate-400">Belum ada item.</p>}
        {items.map((i) => (
          <div key={i.id} className="grid grid-cols-12 gap-2">
            <input className={`${inp} col-span-12 md:col-span-5`} placeholder="Deskripsi" value={i.description}
              onChange={(e) => update(i.id, { description: e.target.value })} />
            <NumericInput className={`${inp} col-span-6 md:col-span-3 text-right`} min={0} value={i.amount}
              onChange={(amount) => update(i.id, { amount })} />
            {vendorLabel ? (
              <input className={`${inp} col-span-5 md:col-span-3`} placeholder={vendorLabel} value={i.vendor}
                onChange={(e) => update(i.id, { vendor: e.target.value })} />
            ) : <div className="hidden md:col-span-3 md:block" />}
            <button type="button" aria-label="Hapus" className="col-span-1 rounded text-red-500 hover:bg-red-50"
              onClick={() => onChange(items.filter((x) => x.id !== i.id))}>✕</button>
          </div>
        ))}
      </div>
      <div className="border-t bg-slate-50 px-4 py-2 text-right text-sm font-semibold">Total: {rupiah(total)}</div>
    </section>
  );
}

interface Props {
  initial: Jobsheet;
  onSave: (js: Jobsheet) => void;
  onPreview: (js: Jobsheet) => void;
  onBack: () => void;
}

export default function JobsheetForm({ initial, onSave, onPreview, onBack }: Props) {
  const [js, setJs] = useState<Jobsheet>(initial);
  const totals = useMemo(() => calcTotals(js), [js.ar, js.ap, js.ctc, js.taxRate, js.taxEnabled]);
  const setHeader = (k: keyof JobsheetHeader, v: string) => setJs({ ...js, header: { ...js.header, [k]: v } });

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <h1 className="text-xl font-bold text-slate-800">Jobsheet {js.header.refNo || '(Baru)'}</h1>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Header Data</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {HEADER_FIELDS.map(([key, label, type]) => (
            <label key={key} className="text-xs font-medium text-slate-600">
              {label}
              <input type={type ?? 'text'} className={`${inp} mt-1`} value={js.header[key]}
                onChange={(e) => setHeader(key, e.target.value)} />
            </label>
          ))}
          <label className="text-xs font-medium text-slate-600">
            Status
            <select className={`${inp} mt-1`} value={js.status}
              onChange={(e) => setJs({ ...js, status: e.target.value as Jobsheet['status'] })}>
              <option>Draft</option><option>Approved</option><option>Selesai</option>
            </select>
          </label>
        </div>
      </section>

      <LineTable title="Account Receivable (AR)" color="bg-green-600" items={js.ar} total={totals.totalAR}
        onChange={(ar) => setJs({ ...js, ar })} />
      <LineTable title="Account Payable (AP) — CTC Vendor" color="bg-red-500" items={js.ap} vendorLabel="Vendor"
        total={totals.totalAP} onChange={(ap) => setJs({ ...js, ap })} />
      <LineTable title="Cost to Cost (CTC)" color="bg-slate-600" items={js.ctc} vendorLabel="Vendor"
        total={totals.totalCTC} onChange={(ctc) => setJs({ ...js, ctc })} />

      <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between"><span>Total AR</span><b>{rupiah(totals.totalAR)}</b></div>
          <div className="flex justify-between"><span>Total AP</span><b>{rupiah(totals.totalAP)}</b></div>
          <div className="flex justify-between"><span>Profit (RV)</span><b>{rupiah(totals.grossProfit)}</b></div>
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={js.taxEnabled}
                onChange={(e) => setJs({ ...js, taxEnabled: e.target.checked })} />
              Kenakan Tax PP 23 (%)
            </label>
            <NumericInput step={0.1} min={0} disabled={!js.taxEnabled}
              className={`${inp} w-24 text-right disabled:bg-slate-100`} value={js.taxRate}
              onChange={(taxRate) => setJs({ ...js, taxRate })} />
            <b>{totals.tax ? rupiah(totals.tax) : '-'}</b>
          </div>
        </div>
        <div className={`mt-3 flex justify-between border-t pt-3 text-lg font-bold ${totals.netProfit < 0 ? 'text-red-600' : 'text-blue-800'}`}>
          <span>Net Profit</span><span>{rupiah(totals.netProfit)}</span>
        </div>
      </section>

      <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        {([['preparedBy', 'Prepared By'], ['approvedBy', 'Approved By'], ['acknowledgedBy', 'Acknowledge By']] as const).map(([k, l]) => (
          <label key={k} className="text-xs font-medium text-slate-600">
            {l}
            <input className={`${inp} mt-1`} value={js.signatures[k]}
              onChange={(e) => setJs({ ...js, signatures: { ...js.signatures, [k]: e.target.value } })} />
          </label>
        ))}
      </section>

      <div className="flex flex-wrap justify-center gap-2 text-sm">
        <button className="rounded border px-3 py-1.5 transition-colors hover:bg-slate-100 active:bg-white active:text-red-600" onClick={onBack}>Kembali</button>
        <button className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700" onClick={() => onPreview(js)}>Print Preview</button>
        <button className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700" onClick={() => onSave(js)}>Simpan</button>
      </div>
    </div>
  );
}