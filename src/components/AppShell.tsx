import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Moon, ShieldCheck, Sun, Waves } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useAppStore();
  return <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white light:bg-[#f8f7ff] light:text-slate-950">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(167,139,250,.22),transparent_28%),linear-gradient(180deg,rgba(3,17,15,.2),#050816)] light:bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,.16),transparent_35%),linear-gradient(180deg,rgba(255,255,255,.2),#f8f7ff)]" />
    <div className="pointer-events-none absolute inset-0 bg-radial-grid bg-[length:24px_24px] opacity-20" />
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/70 backdrop-blur-2xl light:bg-white/70">
      <div className="ticker-mask overflow-hidden border-b border-white/5 py-2 text-xs text-cyan-100/80 light:text-sky-900">
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }} className="flex w-max gap-10 whitespace-nowrap px-4">
          {Array.from({ length: 2 }).map((_, i) => <span key={i} className="flex gap-10"><b>TASI API Gateway</b><span>TradeToken injected on localhost requests</span><span>Auth/Login → Auth/Refresh → Auth/Logout</span><span>Royal blue / violet fintech workspace</span></span>)}
        </motion.div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 shadow-glow"><Waves className="text-ink" /></div><div><h1 className="text-xl font-black tracking-tight">DFN LWAPI Book</h1><p className="text-xs text-white/55 light:text-slate-500">Developed by Hansana Ranaweera</p></div></div>
        <button onClick={toggleTheme} className="rounded-2xl border border-white/10 p-3 hover:bg-white/10" aria-label="Toggle theme">{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
      </div>
    </header>
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">{children}</div>
    <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-white/45 light:text-slate-500"><ShieldCheck className="mx-auto mb-2 text-desert" />Developed by Hansana Ranaweera</footer>
  </main>;
}
