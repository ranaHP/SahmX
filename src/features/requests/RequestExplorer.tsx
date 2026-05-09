import { useMutation } from '@tanstack/react-query';
import { Copy, DatabaseZap, Play, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { sendApiRequest } from '../../api/client';
import { JsonEditor } from '../../components/JsonEditor';
import { ResponsePanel } from '../../components/ResponsePanel';
import { useAppStore } from '../../store/appStore';
import type { AuthSession, JsonObject, RequestDefinition, RequestResult } from '../../types/api';
import { formatJson, safeParseJson } from '../../utils/json';
import { requestDefinitions } from './requestDefinitions';

const categories = ['Authentication & Authorization', 'Customer', 'Order', 'Onboarding', 'Trading / Market features'] as const;

export function RequestExplorer() {
  const { session, manualLoginName } = useAppStore();
  const [activeId, setActiveId] = useState(requestDefinitions[0].id);
  const active = requestDefinitions.find((request) => request.id === activeId) ?? requestDefinitions[0];
  const [payload, setPayload] = useState(formatJson(hydrateBody(active, session, manualLoginName)));
  const [result, setResult] = useState<RequestResult>();

  useEffect(() => {
    setPayload(formatJson(hydrateBody(active, session, manualLoginName)));
  }, [active, activeId, manualLoginName, session]);

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = safeParseJson(payload);
      if (!parsed.ok || typeof parsed.data !== 'object' || parsed.data === null || Array.isArray(parsed.data)) {
        throw new Error(parsed.ok ? 'Payload must be a JSON object' : parsed.error);
      }
      return sendApiRequest({ ...active, body: parsed.data as JsonObject });
    },
    onSuccess: ({ result }) => {
      setResult(result);
      const message = `${active.name} ${result.ok ? 'completed' : 'returned an error'} in ${result.responseTimeMs} ms`;
      if (result.ok) toast.success(message);
      else toast.error(message);
    },
    onError: (error: Error & { result?: RequestResult }) => {
      if (error.result) setResult(error.result);
      toast.error(error.message);
    },
  });

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(active.requiresAuth ? { tradeToken: session?.tradeToken ? '<current tradeToken injected>' : '<missing tradeToken>' } : {}),
    }),
    [active.requiresAuth, session?.tradeToken],
  );

  return (
    <section className="grid gap-5 xl:grid-cols-[310px_1fr]">
      <aside className="glass h-fit rounded-[2rem] p-4">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <DatabaseZap className="text-emeraldx" />
          Request explorer
        </h3>
        {categories.map((category) => (
          <div key={category} className="mb-5">
            <p className="mb-2 text-xs uppercase tracking-[.2em] text-white/45 light:text-slate-500">{category}</p>
            {requestDefinitions
              .filter((request) => request.category === category)
              .map((request) => (
                <button
                  key={request.id}
                  onClick={() => setActiveId(request.id)}
                  className={`mb-2 w-full rounded-2xl border p-3 text-left text-sm ${
                    activeId === request.id ? 'border-emeraldx/60 bg-emeraldx/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2 rounded-lg bg-desert px-2 py-1 text-xs font-black text-ink">{request.method}</span>
                  {request.name}
                  <p className="mt-2 codeblock text-xs text-white/45 light:text-slate-500">{request.endpoint}</p>
                </button>
              ))}
            {category === 'Trading / Market features' ? (
              <p className="rounded-2xl border border-dashed border-white/15 p-3 text-xs text-white/45 light:text-slate-500">
                No separate market-data endpoints were included in the supplied prompt beyond the Order collection, so none are invented here.
              </p>
            ) : null}
          </div>
        ))}
      </aside>

      <div className="space-y-5">
        <div className="glass rounded-[2rem] p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-desert">{active.category}</p>
              <h3 className="text-2xl font-black">{active.name}</h3>
              <p className="mt-1 text-sm text-white/55 light:text-slate-600">{active.description}</p>
            </div>
            <span className="rounded-2xl bg-emeraldx px-3 py-2 font-black text-ink">
              {active.method} {active.endpoint}
            </span>
          </div>

          {active.requiresAuth && !session?.tradeToken ? (
            <div className="mb-4 rounded-2xl border border-red-300/25 bg-red-500/10 p-3 text-sm text-red-100">
              <ShieldAlert className="mr-2 inline" size={16} />
              This request requires the current tradeToken header. Login first.
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="mb-2 font-semibold">Editable JSON payload</p>
              <JsonEditor value={payload} onChange={setPayload} />
            </div>
            <div>
              <p className="mb-2 font-semibold">Headers preview</p>
              <pre className="codeblock rounded-3xl bg-black/35 p-4 text-xs leading-5 text-emerald-100 light:bg-slate-950">
                {JSON.stringify(headers, null, 2)}
              </pre>
              <button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emeraldx to-desert px-5 py-4 font-black text-ink disabled:opacity-60"
              >
                <Play size={16} className="mr-2 inline" />
                {mutation.isPending ? 'Sending…' : 'Send request'}
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(payload).then(() => toast.success('Payload copied'))}
                className="mt-2 w-full rounded-2xl border border-white/10 px-4 py-3"
              >
                <Copy size={15} className="mr-2 inline" />
                Copy payload
              </button>
            </div>
          </div>
        </div>
        <ResponsePanel result={result} />
      </div>
    </section>
  );
}

function hydrateBody(def: RequestDefinition, session: AuthSession | null, loginName: string) {
  const body = { ...def.body };
  if (def.id === 'auth-refresh') body.refreshToken = session?.refreshToken ?? '<current refreshToken>';
  if (def.id === 'auth-logout' || def.id === 'customer-details') body.customerId = session?.customerId ?? '<current customerId>';
  if (def.id === 'customer-buying-power' || def.id === 'customer-symbol-marginability-buying-power') body.cashAccId = session?.cashAccId ?? '<default cashAccId>';
  if (needsTradingAccount(def.id)) body.tradingAccId = session?.tradingAccId ?? '<default tradingAccId>';
  if (needsTradeDate(def.id)) body.tradeDate = currentTradeDate();
  if (def.id === 'order-new') body.remoteClOrdID = crypto.randomUUID();
  if (def.id === 'order-search') {
    body.tradingAccId = [session?.tradingAccId ?? '<default tradingAccId>'];
    body.endDte = currentTradeDate();
  }
  if (def.id === 'auth-otp') body.lgnNme = loginName || session?.loginName || '<selected login name>';
  return body;
}


function needsTradingAccount(id: string) {
  return [
    'customer-symbol-marginability-buying-power',
    'order-list',
    'holdings-list',
    'order-new',
    'order-amend',
    'order-cancel',
    'order-commission',
    'order-search',
  ].includes(id);
}

function needsTradeDate(id: string) {
  return ['order-new', 'order-amend'].includes(id);
}

function currentTradeDate() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}
