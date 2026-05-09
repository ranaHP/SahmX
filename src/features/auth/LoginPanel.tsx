import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { KeyRound, LockKeyhole, Save, ServerCog, Sparkles, Trash2, UserRoundCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginClassic } from '../../api/auth';
import { useAppStore } from '../../store/appStore';
import { demoAccounts } from '../requests/requestDefinitions';

export function LoginPanel() {
  const {
    baseUrl, setBaseUrl, resetBaseUrl, selectedAccountId, setSelectedAccountId, manualLoginName, setManualLoginName,
    savedProfiles, saveProfile, deleteProfile, markProfileUsed,
  } = useAppStore();
  const selected = demoAccounts.find((account) => account.id === selectedAccountId) ?? demoAccounts[0];
  const lgnNme = manualLoginName.trim() || selected.lgnNme;
  const mutation = useMutation({ mutationFn: () => loginClassic(lgnNme), onSuccess: ({ auth }) => {
    if (auth.authSts === 1 || auth.authSts === 9) toast.success('Trade Authentication – Classic succeeded');
    else toast.error(auth.rejResn ? `Login rejected: ${auth.rejResn}` : `Login rejected with authSts ${auth.authSts ?? 'unknown'}`);
  }, onError: (e: Error) => toast.error(e.message) });

  const saveCurrent = () => {
    saveProfile({
      id: `saved-${selected.id}-${Date.now()}`,
      customerReference: selected.customerReference,
      tradingAccount: selected.tradingAccount,
      accountType: selected.accountType,
      symbolHints: selected.symbolHints,
      lgnNme,
      createdAt: Date.now(),
    });
    toast.success('User saved for quick login');
  };

  const quickLogin = (profileId: string, loginName: string) => {
    markProfileUsed(profileId);
    setManualLoginName(loginName);
    loginClassic(loginName).then(({ auth }) => {
      if (auth.authSts === 1 || auth.authSts === 9) toast.success('Quick login succeeded');
      else toast.error(auth.rejResn || 'Quick login rejected');
    }).catch((error: Error) => toast.error(error.message));
  };

  return <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
    <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-6 md:p-8">
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emeraldx/25 bg-emeraldx/10 px-4 py-2 text-sm text-cyan-100 light:text-sky-900"><Sparkles size={16}/> Trading workstation login</div>
      <h2 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">Institution-grade <span className="gradient-text">trading cockpit</span>.</h2>
      <p className="mt-5 max-w-2xl text-white/62 light:text-slate-600">Save encrypted demo users, login in one click, monitor session health, and run bulk order workflows against the local dummy backend or your configured LWAPI gateway.</p>
      <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50 light:text-sky-800"><LockKeyhole className="mr-2 inline" size={16}/> Local demo storage: saved users and tokens stay in this browser only. Use Clear Session after demos.</div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {['Quick login users', 'Bulk order staging', 'Live API blotter'].map((item) => <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">{item}</div>)}
      </div>
    </motion.section>
    <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="space-y-5">
      <div className="glass rounded-[2rem] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><ServerCog className="text-desert"/> Environment settings</h3>
        <label className="text-sm text-white/60 light:text-slate-600">baseUrl</label>
        <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-emeraldx/60 light:bg-white" />
        <div className="mt-3 flex gap-2"><button onClick={() => toast.success('Environment saved to localStorage')} className="rounded-2xl bg-emeraldx px-4 py-2 font-semibold text-ink">Save</button><button onClick={resetBaseUrl} className="rounded-2xl border border-white/10 px-4 py-2">Reset mock</button></div>
      </div>
      <div className="glass rounded-[2rem] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><UserRoundCheck className="text-emeraldx"/> Saved users</h3>
        {savedProfiles.length === 0 ? <p className="rounded-2xl border border-dashed border-white/15 p-3 text-sm text-white/45 light:text-slate-500">No saved users yet. Select or paste a login name, then save it for one-click login.</p> : <div className="grid gap-2">{savedProfiles.map((profile) => <div key={profile.id} className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-3"><button onClick={() => quickLogin(profile.id, profile.lgnNme)} className="min-w-0 text-left"><p className="truncate font-semibold">{profile.accountType}</p><p className="truncate text-xs text-white/50 light:text-slate-500">{profile.customerReference} · {profile.tradingAccount}</p></button><button onClick={() => deleteProfile(profile.id)} className="rounded-xl p-2 text-red-200 hover:bg-red-500/10"><Trash2 size={15}/></button></div>)}</div>}
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
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><button disabled={mutation.isPending} onClick={() => mutation.mutate()} className="rounded-2xl bg-gradient-to-r from-emeraldx to-desert px-5 py-4 font-black text-ink shadow-glow disabled:opacity-60">{mutation.isPending ? 'Authenticating…' : 'POST /Auth/Login'}</button><button onClick={saveCurrent} className="rounded-2xl border border-white/10 px-4 py-3 font-semibold hover:bg-white/10"><Save size={16} className="mr-2 inline"/>Save user</button></div>
      </div>
    </motion.section>
  </div>;
}
