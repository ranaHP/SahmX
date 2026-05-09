import type { AuthSession, RequestResult } from '../types/api';

export const STORAGE_KEYS = {
  baseUrl: 'dfn_lwapi_base_url',
  session: 'dfn_lwapi_session',
  history: 'dfn_lwapi_request_history',
  theme: 'dfn_lwapi_theme',
  autoRefresh: 'dfn_lwapi_auto_refresh',
} as const;

export const DEFAULT_BASE_URL = 'http://localhost:8080';

export function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const loadSession = () => readJson<AuthSession | null>(STORAGE_KEYS.session, null);
export const saveSession = (session: AuthSession | null) => session ? writeJson(STORAGE_KEYS.session, session) : localStorage.removeItem(STORAGE_KEYS.session);
export const loadHistory = () => readJson<RequestResult[]>(STORAGE_KEYS.history, []);
export const saveHistory = (history: RequestResult[]) => writeJson(STORAGE_KEYS.history, history.slice(0, 80));
