import { Copy, FileJson, TerminalSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import type { RequestResult } from '../types/api';

export function ResponsePanel({ result }: { result?: RequestResult }) {
  if (!result) return <div className="glass rounded-3xl p-6 text-center text-sm text-white/55 light:text-slate-600">Send a request to see raw and formatted responses here.</div>;
  const copy = () => navigator.clipboard.writeText(result.responseRaw).then(() => toast.success('Response copied'));
  return <div className="glass overflow-hidden rounded-3xl">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
      <div className="flex items-center gap-3"><TerminalSquare className="text-emeraldx" /><div><p className="font-semibold">Response viewer</p><p className="text-xs text-white/50 light:text-slate-500">HTTP {result.status ?? 'n/a'} · {result.responseTimeMs} ms</p></div></div>
      <button onClick={copy} className="rounded-2xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"><Copy size={15} className="mr-2 inline" />Copy response</button>
    </div>
    <div className="grid gap-4 p-4 lg:grid-cols-2">
      <div><p className="mb-2 flex items-center gap-2 text-sm font-semibold"><FileJson size={16}/>Formatted JSON</p><pre className="codeblock max-h-[480px] overflow-auto rounded-2xl bg-black/35 p-4 text-xs leading-5 text-emerald-100 light:bg-slate-950">{result.responseJson ? JSON.stringify(result.responseJson, null, 2) : result.responseRaw}</pre></div>
      <div><p className="mb-2 flex items-center gap-2 text-sm font-semibold"><TerminalSquare size={16}/>Raw response</p><pre className="codeblock max-h-[480px] overflow-auto rounded-2xl bg-black/35 p-4 text-xs leading-5 text-slate-100 light:bg-slate-950">{result.responseRaw}</pre></div>
    </div>
  </div>;
}
