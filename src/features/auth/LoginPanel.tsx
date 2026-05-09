import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { KeyRound, LockKeyhole, ServerCog, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginClassic } from '../../api/auth';
import { useAppStore } from '../../store/appStore';
import { demoAccounts } from '../requests/requestDefinitions';

export function LoginPanel() {
  const { baseUrl, setBaseUrl, resetBaseUrl, selectedAccountId, setSelectedAccountId, manualLoginName, setManualLoginName } = useAppStore();
  const selected = demoAccounts.find((account) => account.id === selectedAccountId) ?? demoAccounts[0];
  const lgnNme = manualLoginName.trim() || selected.lgnNme;
  const mutation = useMutation({ mutationFn: () => loginClassic(lgnNme), onSuccess: ({ auth }) => {
    if (auth.authSts === 1 || auth.authSts === 9) toast.success('Trade Authentication – Classic succeeded');
    else toast.error(auth.rejResn ? `Login rejected: ${auth.rejResn}` : `Login rejected with authSts ${auth.authSts ?? 'unknown'}`);
  }, onError: (e: Error) => toast.error(e.message) });

  return <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
    <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-6 md:p-8">
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emeraldx/25 bg-emeraldx/10 px-4 py-2 text-sm text-emerald-100 light:text-emerald-900"><Sparkles size={16}/> Start with Trade Authentication – Classic</div>
      <h2 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">Premium Saudi share-market <span className="gradient-text">API cockpit</span>.</h2>
      <p className="mt-5 max-w-2xl text-white/62 light:text-slate-600">This demo only sends requests from the provided DFN LWAPI GW REST flow: login, refresh, logout, OTP, and customer availability. Session data is stored in localStorage for localhost/demo use.</p>
      <div className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100 light:text-amber-800"><LockKeyhole className="mr-2 inline" size={16}/> Security note: tokens are masked but persisted locally. Use Clear Session after demos.</div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {['Animated gradients', 'Token reuse', 'Raw responses'].map((item) => <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">{item}</div>)}
      </div>
    </motion.section>
    <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="space-y-5">
      <div className="glass rounded-[2rem] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><ServerCog className="text-desert"/> Environment settings</h3>
        <label className="text-sm text-white/60 light:text-slate-600">baseUrl</label>
        <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-emeraldx/60 light:bg-white" />
        <div className="mt-3 flex gap-2"><button onClick={() => toast.success('Environment saved to localStorage')} className="rounded-2xl bg-emeraldx px-4 py-2 font-semibold text-ink">Save</button><button onClick={resetBaseUrl} className="rounded-2xl border border-white/10 px-4 py-2">Reset localhost</button></div>
      </div>
      <div className="glass rounded-[2rem] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><KeyRound className="text-emeraldx"/> Account switcher</h3>
        <div className="grid gap-3">
          {demoAccounts.map((account) => <button key={account.id} onClick={() => setSelectedAccountId(account.id)} className={`rounded-3xl border p-4 text-left transition ${selectedAccountId === account.id ? 'border-emeraldx/70 bg-emeraldx/10 shadow-glow' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
            <p className="font-bold">{account.accountType}</p><p className="text-sm text-white/60 light:text-slate-600">{account.customerReference} · {account.tradingAccount}</p><p className="text-xs text-desert">{account.symbolHints}</p>
          </button>)}
        </div>
        <label className="mt-4 block text-sm text-white/60 light:text-slate-600">Manual encrypted lgnNme override</label>
        <textarea value={manualLoginName} onChange={(e) => setManualLoginName(e.target.value)} placeholder={selected.lgnNme} className="codeblock mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-black/25 p-3 text-xs outline-none focus:border-emeraldx/60 light:bg-white" />
        <button disabled={mutation.isPending} onClick={() => mutation.mutate()} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emeraldx to-desert px-5 py-4 font-black text-ink shadow-glow disabled:opacity-60">{mutation.isPending ? 'Authenticating…' : 'POST /Auth/Login'}</button>
      </div>
    </motion.section>
  </div>;
}
