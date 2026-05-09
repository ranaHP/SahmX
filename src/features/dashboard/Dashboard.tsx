import { motion } from 'framer-motion';
import { Activity, BadgeCheck, Clock, Landmark, UserRound, Zap } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { secondsToLabel } from '../../utils/json';

export function Dashboard() {
  const { session, history } = useAppStore();
  const latency = [...history].reverse().slice(-12).map((h, i) => ({ name: `${i + 1}`, ms: h.responseTimeMs, ok: h.ok ? 1 : 0 }));
  const trend = [...history].reverse().slice(-12).map((h, i) => ({ name: `${i + 1}`, success: h.ok ? 1 : 0, failure: h.ok ? 0 : 1 }));
  const cards: Array<[string, string | number, LucideIcon]> = [
    ['Session status', session ? 'Authenticated' : 'Guest', BadgeCheck], ['Customer name', session?.cusNme || 'Not supplied', UserRound], ['Customer ID', session?.customerId || 'Not supplied', Landmark], ['Institution ID', session?.instId || 'Not supplied', Landmark], ['Last login time', session?.lstLgnTme || 'Not supplied', Clock], ['Token refresh interval', secondsToLabel(session?.tokenRefreshInt), Zap], ['Default trading account', session?.tradingAccId || 'Run Customer Details', Landmark], ['Default cash account', session?.cashAccId || 'Run Customer Details', Landmark],
  ];
  return <section className="space-y-6">
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass relative overflow-hidden rounded-[2rem] p-6 md:p-8">
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emeraldx/20 blur-3xl"/><div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-desert/20 blur-3xl"/>
      <div className="relative max-w-3xl"><p className="mb-3 text-sm uppercase tracking-[.35em] text-desert">Saudi brokerage dashboard</p><h2 className="text-3xl font-black md:text-5xl">Live API session intelligence with premium market visuals.</h2><p className="mt-4 text-white/60 light:text-slate-600">Financial widgets below are built from local request history. Portfolio summary is demo/visual-only unless supported API data is added by the provided collection.</p></div>
    </motion.div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, Icon], i) => <motion.div key={String(label)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }} className="glass rounded-3xl p-5"><Icon className="mb-4 text-emeraldx"/><p className="text-sm text-white/50 light:text-slate-500">{label as string}</p><p className="mt-1 truncate text-xl font-bold">{String(value)}</p></motion.div>)}</div>
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="glass rounded-3xl p-5"><p className="mb-1 flex items-center gap-2 font-bold"><Activity className="text-desert"/>Demo portfolio visual</p><p className="text-xs text-amber-100/80 light:text-amber-800">Visual-only placeholder: no real balances are displayed.</p><div className="mt-6 space-y-3"><div className="h-4 rounded-full bg-gradient-to-r from-emeraldx to-desert"/><div className="h-4 w-3/4 rounded-full bg-white/15"/><div className="h-4 w-1/2 rounded-full bg-white/10"/></div></div>
      <ChartCard title="Request latency" type="area" data={latency}/><ChartCard title="Success / failure trend" type="bar" data={trend}/>
    </div>
    <div className="glass rounded-3xl p-5"><h3 className="mb-4 text-lg font-bold">Recent API calls timeline</h3>{history.length === 0 ? <p className="text-white/50 light:text-slate-500">No calls yet. Use the request explorer to build history.</p> : <div className="space-y-3">{history.slice(0, 8).map((h) => <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-3"><span>{h.name}</span><span className={h.ok ? 'text-emeraldx' : 'text-red-300'}>{h.status ?? 'network'} · {h.responseTimeMs} ms</span></div>)}</div>}</div>
  </section>;
}
function ChartCard({ title, type, data }: { title: string; type: 'area' | 'bar'; data: Record<string, unknown>[] }) {
  return <div className="glass h-72 rounded-3xl p-5"><h3 className="mb-4 font-bold">{title}</h3>{data.length ? <ResponsiveContainer width="100%" height="82%">{type === 'area' ? <AreaChart data={data}><defs><linearGradient id="ms" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00e195" stopOpacity={0.65}/><stop offset="95%" stopColor="#00e195" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Area type="monotone" dataKey="ms" stroke="#00e195" fill="url(#ms)"/></AreaChart> : <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="success" fill="#00e195"/><Bar dataKey="failure" fill="#f87171"/></BarChart>}</ResponsiveContainer> : <p className="text-sm text-white/50 light:text-slate-500">Awaiting request history.</p>}</div>;
}
