import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, BookOpen, CandlestickChart, LogOut, SendHorizonal } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { logoutTrade } from './api/auth';
import { AppShell } from './components/AppShell';
import { LoginPanel } from './features/auth/LoginPanel';
import { TokenManager } from './features/auth/TokenManager';
import { Dashboard } from './features/dashboard/Dashboard';
import { RequestExplorer } from './features/requests/RequestExplorer';
import { TradingDesk } from './features/trading/TradingDesk';
import { useAppStore } from './store/appStore';

type AppTab = 'dashboard' | 'trade' | 'requests';

function App() {
  const session = useAppStore((s) => s.session);
  const [tab, setTab] = useState<AppTab>('trade');
  const logout = useMutation({ mutationFn: logoutTrade, onSuccess: ({ auth }) => auth.status === 1 ? toast.success('Logged out') : toast.error(auth.rejResn || 'Logout did not return status 1'), onError: (e: Error) => toast.error(e.message) });
  return <AppShell>
    {!session ? <LoginPanel /> : <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="flex items-center gap-2 text-sm text-desert"><BookOpen size={16}/>DFN LWAPI Trading Workspace</p><h2 className="text-3xl font-black">Welcome{session.cusNme ? `, ${session.cusNme}` : ''}</h2></div><div className="flex flex-wrap gap-2"><button onClick={() => setTab('dashboard')} className={`rounded-2xl px-4 py-3 ${tab === 'dashboard' ? 'bg-emeraldx text-ink' : 'glass'}`}><BarChart3 size={16} className="mr-2 inline"/>Dashboard</button><button onClick={() => setTab('trade')} className={`rounded-2xl px-4 py-3 ${tab === 'trade' ? 'bg-emeraldx text-ink' : 'glass'}`}><CandlestickChart size={16} className="mr-2 inline"/>Trading Desk</button><button onClick={() => setTab('requests')} className={`rounded-2xl px-4 py-3 ${tab === 'requests' ? 'bg-emeraldx text-ink' : 'glass'}`}><SendHorizonal size={16} className="mr-2 inline"/>API Console</button><button onClick={() => logout.mutate()} className="rounded-2xl border border-red-300/25 px-4 py-3 text-red-100 hover:bg-red-500/10"><LogOut size={16} className="mr-2 inline"/>Logout</button></div></div>
      <TokenManager />
      <AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: .25 }}>{tab === 'dashboard' ? <Dashboard /> : tab === 'trade' ? <TradingDesk /> : <RequestExplorer />}</motion.div></AnimatePresence>
    </div>}
  </AppShell>;
}
export default App;
