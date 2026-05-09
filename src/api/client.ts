import axios, { AxiosError } from 'axios';
import type { AuthResponse, CustomerDetailsResponse, JsonObject, JsonValue, RequestResult } from '../types/api';
import { useAppStore } from '../store/appStore';

export interface SendApiOptions {
  id: string;
  name: string;
  method: 'POST';
  endpoint: string;
  body: JsonObject;
  requiresAuth: boolean;
}

export async function sendApiRequest(options: SendApiOptions): Promise<{ data: JsonValue; result: RequestResult }> {
  const { baseUrl, session } = useAppStore.getState();
  const started = performance.now();
  const url = `${baseUrl}${options.endpoint}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.requiresAuth && session?.tradeToken) headers.tradeToken = session.tradeToken;

  try {
    const response = await axios.request({ method: options.method, url, data: options.body, headers, validateStatus: () => true });
    const responseTimeMs = Math.round(performance.now() - started);
    const data = response.data as JsonValue;
    const businessOk = isBusinessSuccess(options.id, data);
    const result: RequestResult = {
      id: crypto.randomUUID(),
      requestId: options.id,
      name: options.name,
      endpoint: options.endpoint,
      method: options.method,
      ok: response.status >= 200 && response.status < 300 && businessOk,
      status: response.status,
      responseTimeMs,
      timestamp: Date.now(),
      requestBody: JSON.stringify(options.body, null, 2),
      responseRaw: typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2),
      responseJson: data,
    };
    useAppStore.getState().addHistory(result);
    applyCollectionVariableSideEffects(options.id, data, options.body);
    return { data, result };
  } catch (error) {
    const responseTimeMs = Math.round(performance.now() - started);
    const axiosError = error as AxiosError;
    const message = axiosError.code === 'ERR_NETWORK'
      ? `Network diagnostics: unable to reach ${url}. Verify baseUrl, CORS, gateway status, and localhost port.`
      : axiosError.message;
    const result: RequestResult = {
      id: crypto.randomUUID(), requestId: options.id, name: options.name, endpoint: options.endpoint, method: options.method,
      ok: false, status: axiosError.response?.status, responseTimeMs, timestamp: Date.now(), requestBody: JSON.stringify(options.body, null, 2),
      responseRaw: axiosError.response?.data ? JSON.stringify(axiosError.response.data, null, 2) : message, errorMessage: message,
    };
    useAppStore.getState().addHistory(result);
    throw Object.assign(new Error(message), { result });
  }
}

export function sessionFromAuth(data: AuthResponse, loginName?: string) {
  return {
    tradeToken: String(data.tradeToken ?? ''),
    refreshToken: String(data.refreshToken ?? ''),
    customerId: data.customerId ?? '',
    instId: data.instId ?? '',
    cusNme: data.cusNme,
    priceToken: data.priceToken,
    tokenRefreshInt: data.tokenRefreshInt,
    lstLgnTme: data.lstLgnTme,
    loginName,
    savedAt: Date.now(),
    lastRefreshAt: Date.now(),
  };
}


function applyCollectionVariableSideEffects(requestId: string, data: JsonValue, body: JsonObject) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return;
  const response = data as AuthResponse;
  const store = useAppStore.getState();

  if (requestId === 'auth-login-classic') {
    if (response.authSts === 1 || response.authSts === 9) {
      store.setSession(sessionFromAuth(response, typeof body.lgnNme === 'string' ? body.lgnNme : undefined));
    } else {
      store.clearSession();
    }
  }

  if (requestId === 'auth-refresh') {
    if (response.authSts === 1 && store.session) {
      store.setSession({
        ...store.session,
        tradeToken: String(response.tradeToken ?? store.session.tradeToken),
        refreshToken: String(response.refreshToken ?? store.session.refreshToken),
        lastRefreshAt: Date.now(),
      });
    } else if (response.authSts !== undefined && response.authSts !== 1) {
      store.clearSession();
    }
  }

  if (requestId === 'auth-logout' && response.status === 1) {
    store.clearSession();
  }

  if (requestId === 'customer-profile') {
    store.updateSession({
      cusNme: response.custNme ?? response.cusNme ?? store.session?.cusNme,
      customerId: response.custId ?? response.customerId ?? store.session?.customerId ?? '',
      priceToken: response.priceToken ?? store.session?.priceToken,
      lstLgnTme: response.lastLogin ?? response.lstLgnTme ?? store.session?.lstLgnTme,
    });
  }

  if (requestId === 'customer-details') {
    const details = data as CustomerDetailsResponse;
    const defaultTrading = details.tradingAccounts?.find((account) => account.isDefaultAccount === true);
    const defaultCash = details.cashAccounts?.find((account) => account.isDefaultAccount === true);
    store.updateSession({
      tradingAccId: defaultTrading?.tradingAccId ?? null,
      cashAccId: defaultCash?.cashAccId ?? null,
    });
  }
}


function isBusinessSuccess(requestId: string, data: JsonValue): boolean {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return true;
  const response = data as AuthResponse;
  if (requestId === 'auth-login-classic') return response.authSts === 1 || response.authSts === 9;
  if (requestId === 'auth-refresh') return response.authSts === 1;
  if (requestId === 'auth-logout') return response.status === 1;
  if (requestId === 'auth-verify') return response.isAuthenticated === true;
  return true;
}
