import { useState } from 'react';
import JobsheetForm from './JobsheetForm';
import JobsheetPreview from './JobsheetPreview';
import { mockJobsheets } from './mockData';
import { Jobsheet } from './types';
import { calcTotals, emptyJobsheet, rupiah } from './utils';

type View = { name: 'list' } | { name: 'form'; js: Jobsheet } | { name: 'preview'; js: Jobsheet; from: Jobsheet };

function Login({ onLogin }: { onLogin: (u: string) => void }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [logoOk, setLogoOk] = useState(true);
  const submit = () => (u && p === 'akl123' ? onLogin(u) : setErr('Username/password salah (demo: password akl123)'));
  return (
    <>
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgb(241 245 249) inset !important;
          -webkit-text-fill-color: rgb(51 65 85) !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow">
          <div className="mb-6 text-center">
            {/* logo */}
            {logoOk ? (
              <img src="/Logo.png" alt="LogoAKL" className="mx-auto mb-4 h-20 w-auto object-contain"
                onError={() => setLogoOk(false)} />
            ) : (
              <div className="mx-auto mb-4 text-5xl font-black italic tracking-tight text-slate-800">
                AKL<span className="text-red-600">›</span>
              </div>
            )}
            <h1 className="text-xl font-bold tracking-wide text-slate-900">LOGISTIC SYSTEM</h1>
            <p className="mt-1 text-sm font-semibold text-slate-700">PT. Anugrah Karunia Logistik</p>
            <p className="mt-1 text-xs text-slate-500">Sistem Manajemen Jobsheet &amp; Keuangan</p>
          </div>
          <div className="space-y-3">
            <input className="w-full rounded border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none" placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} />
            <input className="w-full rounded border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none" type="password" placeholder="Password" value={p}
              onChange={(e) => setP(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
            {err && <p className="text-xs text-red-600">{err}</p>}
            <button className="w-full rounded bg-red-600 py-2 text-sm text-white hover:bg-red-700" onClick={submit}>Masuk</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [list, setList] = useState<Jobsheet[]>(mockJobsheets);
  const [view, setView] = useState<View>({ name: 'list' });

  const handleDelete = (js: Jobsheet) => {
    if (window.confirm(`Hapus jobsheet ${js.header.refNo || '(tanpa Ref No)'}? Tindakan ini tidak bisa dibatalkan.`)) {
      setList((l) => l.filter((x) => x.id !== js.id));
    }
  };

  if (!user) return <Login onLogin={setUser} />;
  if (view.name === 'form')
    return <JobsheetForm initial={view.js} onBack={() => setView({ name: 'list' })}
      onPreview={(js) => setView({ name: 'preview', js, from: js })}
      onSave={(js) => { setList((l) => (l.some((x) => x.id === js.id) ? l.map((x) => (x.id === js.id ? js : x)) : [js, ...l])); setView({ name: 'list' }); }} />;
  if (view.name === 'preview')
    return <JobsheetPreview js={view.js} onBack={() => setView({ name: 'form', js: view.from })} />;

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Daftar Jobsheet</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">{user}</span>
          <button className="rounded bg-red-600 px-3 py-1.5 text-white transition-colors hover:bg-red-700 active:bg-white active:text-red-600" onClick={() => setView({ name: 'form', js: emptyJobsheet() })}>+ Jobsheet Baru</button>
          <button className="rounded border px-3 py-1.5 transition-colors active:bg-white active:text-red-600" onClick={() => setUser(null)}>Keluar</button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{['Ref No', 'Tanggal', 'Shipper', 'Consignee', 'Vessel/Voyage', 'Net Profit', 'Status', ''].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">Belum ada jobsheet.</td></tr>
            )}
            {list.map((js) => (
              <tr key={js.id} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2 font-medium">{js.header.refNo}</td>
                <td className="px-3 py-2">{js.header.date}</td>
                <td className="px-3 py-2">{js.header.shipper}</td>
                <td className="px-3 py-2">{js.header.consignee}</td>
                <td className="px-3 py-2">{js.header.vessel}</td>
                <td className="px-3 py-2">{rupiah(calcTotals(js).netProfit)}</td>
                <td className="px-3 py-2"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{js.status}</span></td>
                <td className="space-x-2 whitespace-nowrap px-3 py-2 text-right">
                  <button className="text-blue-600 hover:underline" onClick={() => setView({ name: 'form', js })}>Buka</button>
                  <button className="text-slate-600 hover:underline" onClick={() => setView({ name: 'preview', js, from: js })}>Cetak</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(js)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}