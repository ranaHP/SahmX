import { AlertTriangle } from 'lucide-react';
import { safeParseJson } from '../utils/json';

interface Props { value: string; onChange: (value: string) => void; minHeight?: string; }
export function JsonEditor({ value, onChange, minHeight = '220px' }: Props) {
  const parsed = safeParseJson(value);
  return <div>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} style={{ minHeight }} className="codeblock w-full resize-y rounded-3xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-emerald-50 outline-none transition focus:border-emeraldx/60 focus:ring-4 focus:ring-emeraldx/10 light:bg-slate-950 light:text-emerald-100" />
    {!parsed.ok && <div className="mt-2 flex items-center gap-2 text-sm text-amber-300"><AlertTriangle size={16} /> Invalid JSON: {parsed.error}</div>}
  </div>;
}
