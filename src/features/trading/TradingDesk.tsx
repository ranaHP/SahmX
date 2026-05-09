import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, PlayCircle, Plus, Send, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { sendApiRequest } from '../../api/client';
import { useAppStore } from '../../store/appStore';
import type { BulkOrderDraft, RequestResult } from '../../types/api';

const starterOrders: BulkOrderDraft[] = [
  { id: crypto.randomUUID(), symbol: '1010', side: '1', ordQty: 1500, price: 1.6, ordTyp: '2', tif: 0, minQty: 100, disQty: 0 },
  { id: crypto.randomUUID(), symbol: '1050', side: '1', ordQty: 500, price: 24.8, ordTyp: '2', tif: 0, minQty: 0, disQty: 0 },
  { id: crypto.randomUUID(), symbol: '2222', side: '2', ordQty: 250, price: 31.2, ordTyp: '2', tif: 0, minQty: 0, disQty: 0 },
];

export function TradingDesk() {
  const session = useAppStore((state) => state.session);
  const [orders, setOrders] = useState<BulkOrderDraft[]>(starterOrders);
  const [isSending, setIsSending] = useState(false);
  const [armed, setArmed] = useState(false);
  const [results, setResults] = useState<RequestResult[]>([]);
  const notional = useMemo(() => orders.reduce((sum, order) => sum + order.price * order.ordQty, 0), [orders]);

  const update = (id: string, patch: Partial<BulkOrderDraft>) => setOrders((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  const addOrder = () => setOrders((items) => [...items, { id: crypto.randomUUID(), symbol: '1010', side: '1', ordQty: 100, price: 1.6, ordTyp: '2', tif: 0, minQty: 0, disQty: 0 }]);
  const removeOrder = (id: string) => setOrders((items) => items.filter((item) => item.id !== id));

  const sendBulk = async () => {
    if (!session?.tradeToken) return toast.error('Login before sending orders');
    if (!session.tradingAccId) return toast.error('Run Customer Details first to load default tradingAccId');
    if (!armed) return toast.error('Arm bulk send before submitting orders');
    setIsSending(true);
    setResults([]);
    const sent: RequestResult[] = [];
    for (const order of orders) {
      const payload = {
        msgType: 2,
        tradingAccId: session.tradingAccId,
        symbol: order.symbol,
        exg: 'TDWL',
        ordTyp: order.ordTyp,
        ordSide: order.side,
        price: order.price,
        ordQty: order.ordQty,
        tif: order.tif,
        disQty: order.disQty,
        minQty: order.minQty,
        tradeDate: currentTradeDate(),
        dayOrd: 0,
        remoteClOrdID: crypto.randomUUID(),
        marketCode: 'ALL',
        instruTyp: 0,
      };
      try {
        const { result } = await sendApiRequest({ id: 'order-new', name: `Bulk New Order · ${order.symbol}`, method: 'POST', endpoint: '/Order/New', requiresAuth: true, body: payload });
        sent.push(result);
        setResults([...sent]);
      } catch (error) {
        const maybeResult = error as Error & { result?: RequestResult };
        if (maybeResult.result) {
          sent.push(maybeResult.result);
          setResults([...sent]);
        }
      }
    }
    setIsSending(false);
    setArmed(false);
    toast.success(`Bulk order batch finished: ${sent.filter((item) => item.ok).length}/${orders.length} accepted`);
  };

  return <section className="space-y-6">
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass overflow-hidden rounded-[2rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[.32em] text-desert">Trading desk</p>
          <h2 className="text-3xl font-black md:text-5xl">Bulk order staging blotter</h2>
          <p className="mt-3 max-w-3xl text-white/60 light:text-slate-600">This is a trading-app workflow, not a Swagger screen. Stage multiple TDWL orders, review notional exposure, arm the batch, and send sequential `/Order/New` requests with one click.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4 light:bg-white/70">
          <p className="text-xs uppercase tracking-[.22em] text-white/45 light:text-slate-500">Batch notional</p>
          <p className="mt-1 text-2xl font-black text-emeraldx">SAR {notional.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-white/45 light:text-slate-500">TradingAccId: {session?.tradingAccId ?? 'Run Customer Details'}</p>
        </div>
      </div>
    </motion.div>

    <div className="glass rounded-[2rem] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-xl font-bold">Order entry grid</h3><p className="text-sm text-white/50 light:text-slate-500">Side 1 = Buy, Side 2 = Sell · Endpoint POST /Order/New</p></div>
        <button onClick={addOrder} className="rounded-2xl border border-white/10 px-4 py-2 hover:bg-white/10"><Plus size={16} className="mr-2 inline"/>Add row</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-y-2 text-sm">
          <thead className="text-left text-xs uppercase tracking-[.18em] text-white/45 light:text-slate-500"><tr><th>Symbol</th><th>Side</th><th>Qty</th><th>Limit</th><th>Type</th><th>TIF</th><th>Min</th><th>Disc.</th><th>Notional</th><th></th></tr></thead>
          <tbody>{orders.map((order) => <tr key={order.id} className="rounded-2xl bg-white/5">
            <td><Cell value={order.symbol} onChange={(value) => update(order.id, { symbol: value.toUpperCase() })}/></td>
            <td><select value={order.side} onChange={(e) => update(order.id, { side: e.target.value as '1' | '2' })} className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2"><option value="1">Buy</option><option value="2">Sell</option></select></td>
            <td><Cell type="number" value={order.ordQty} onChange={(value) => update(order.id, { ordQty: Number(value) })}/></td>
            <td><Cell type="number" value={order.price} onChange={(value) => update(order.id, { price: Number(value) })}/></td>
            <td><select value={order.ordTyp} onChange={(e) => update(order.id, { ordTyp: e.target.value as '1' | '2' })} className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2"><option value="2">Limit</option><option value="1">Market</option></select></td>
            <td><Cell type="number" value={order.tif} onChange={(value) => update(order.id, { tif: Number(value) })}/></td>
            <td><Cell type="number" value={order.minQty} onChange={(value) => update(order.id, { minQty: Number(value) })}/></td>
            <td><Cell type="number" value={order.disQty} onChange={(value) => update(order.id, { disQty: Number(value) })}/></td>
            <td className="font-semibold">SAR {(order.price * order.ordQty).toLocaleString()}</td>
            <td><button onClick={() => removeOrder(order.id)} className="rounded-xl p-2 text-red-200 hover:bg-red-500/10"><Trash2 size={16}/></button></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={armed} onChange={(e) => setArmed(e.target.checked)} /> I reviewed these orders and want to send this bulk request batch.</label>
        <button disabled={isSending || !armed} onClick={sendBulk} className="rounded-2xl bg-gradient-to-r from-emeraldx to-desert px-5 py-3 font-black text-ink disabled:opacity-50"><Send size={16} className="mr-2 inline"/>{isSending ? 'Sending batch…' : `Send ${orders.length} orders`}</button>
      </div>
    </div>

    <div className="glass rounded-[2rem] p-5">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold"><PlayCircle className="text-desert"/>Bulk send results</h3>
      {results.length === 0 ? <p className="flex items-center gap-2 text-sm text-white/50 light:text-slate-500"><AlertTriangle size={16}/>No bulk results yet.</p> : <div className="grid gap-2">{results.map((result) => <div key={result.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-3"><span className="flex items-center gap-2"><CheckCircle2 className={result.ok ? 'text-emeraldx' : 'text-red-300'} size={16}/>{result.name}</span><span className="text-sm text-white/55 light:text-slate-500">HTTP {result.status ?? 'n/a'} · {result.responseTimeMs} ms</span></div>)}</div>}
    </div>
  </section>;
}

function Cell({ value, onChange, type = 'text' }: { value: string | number; onChange: (value: string) => void; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 outline-none focus:border-emeraldx/60 light:bg-white" />;
}

function currentTradeDate() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}
