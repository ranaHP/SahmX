import { Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { maskSecret } from '../utils/json';

export function TokenCard({ label, value }: { label: string; value?: string | number }) {
  const [show, setShow] = useState(false);
  const text = value === undefined || value === null || value === '' ? 'Not available' : String(value);
  const copy = () => navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`));
  return <div className="rounded-3xl border border-white/10 bg-black/20 p-4 light:bg-slate-50">
    <p className="text-xs uppercase tracking-[.22em] text-white/45 light:text-slate-500">{label}</p>
    <div className="mt-2 flex items-center justify-between gap-2">
      <span className="codeblock truncate text-sm text-emerald-100 light:text-emerald-800">{show ? text : maskSecret(text)}</span>
      <div className="flex gap-1"><button className="rounded-xl p-2 hover:bg-white/10" onClick={() => setShow(!show)}>{show ? <EyeOff size={15}/> : <Eye size={15}/>}</button><button className="rounded-xl p-2 hover:bg-white/10" onClick={copy}><Copy size={15}/></button></div>
    </div>
  </div>;
}
