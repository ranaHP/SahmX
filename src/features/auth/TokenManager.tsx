import { useMutation } from '@tanstack/react-query';
import { BadgeCheck, RefreshCcw, ShieldAlert, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { refreshTradeToken, verifyTradeToken } from '../../api/auth';
import type { JsonValue } from '../../types/api';
import { TokenCard } from '../../components/TokenCard';
import { useAppStore } from '../../store/appStore';
import { secondsToLabel } from '../../utils/json';

export function TokenManager() {
  const { session, clearSession, autoRefresh, setAutoRefresh } = useAppStore();
  const [now, setNow] = useState(0);
  const refreshMutation = useMutation({
    mutationFn: refreshTradeToken,
    onSuccess: ({ auth }) => auth.authSts === 1 ? toast.success('Token refreshed') : toast.error(auth.rejResn || 'Refresh rejected; session cleared'),
    onError: (e: Error) => toast.error(e.message),
  });
  const verifyMutation = useMutation({
    mutationFn: verifyTradeToken,
    onSuccess: ({ verification }) => {
      const verified = isVerifiedTokenResponse(verification);
      if (verified) toast.success('Trade token verified');
      else toast.error('Token verification failed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const ageSeconds = useMemo(() => session && now ? Math.floor((now - session.savedAt) / 1000) : 0, [now, session]);
  const warning = Boolean(session?.tokenRefreshInt && ageSeconds > session.tokenRefreshInt * .8);

  useEffect(() => {
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (!autoRefresh || !session?.tokenRefreshInt) return;
    const interval = window.setInterval(() => refreshMutation.mutate(), Math.max(15, session.tokenRefreshInt - 10) * 1000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, refreshMutation, session?.tokenRefreshInt]);

  if (!session) return null;
  return <aside className="glass rounded-[2rem] p-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="text-lg font-bold">Token manager</h3><p className="text-xs text-white/50 light:text-slate-500">Masked by default · localStorage demo persistence</p></div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => verifyMutation.mutate()} className="rounded-2xl border border-white/10 px-4 py-2 font-semibold hover:bg-white/10"><BadgeCheck size={15} className="mr-2 inline"/>Verify</button>
        <button onClick={() => refreshMutation.mutate()} className="rounded-2xl bg-emeraldx px-4 py-2 font-semibold text-ink"><RefreshCcw size={15} className="mr-2 inline"/>Refresh</button>
      </div>
    </div>
    {warning && <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100 light:text-amber-800"><ShieldAlert className="mr-2 inline" size={16}/>Token age is near the supplied refresh interval.</div>}
    <div className="grid gap-3 md:grid-cols-2"><TokenCard label="tradeToken" value={session.tradeToken}/><TokenCard label="refreshToken" value={session.refreshToken}/><TokenCard label="customerId" value={session.customerId}/><TokenCard label="instId" value={session.instId}/><TokenCard label="tradingAccId" value={session.tradingAccId ?? undefined}/><TokenCard label="cashAccId" value={session.cashAccId ?? undefined}/></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm"><span>Age: {secondsToLabel(ageSeconds)} · Refresh interval: {secondsToLabel(session.tokenRefreshInt)}</span><label className="flex items-center gap-2"><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} /> Auto-refresh</label></div>
    <button onClick={clearSession} className="mt-4 w-full rounded-2xl border border-red-300/25 px-4 py-3 text-red-200 hover:bg-red-500/10"><Trash2 size={16} className="mr-2 inline"/>Clear Session</button>
  </aside>;
}


function isVerifiedTokenResponse(value: JsonValue): boolean {
  return !Array.isArray(value) && typeof value === 'object' && value !== null && value.isAuthenticated === true;
}
